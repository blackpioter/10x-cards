import type {
  ModelParameters,
  ChatMessage,
  ChatResponse,
  APIErrorResponse,
  RateLimitConfig,
  RateLimitInfo,
  OpenRouterConfig,
} from "./openrouter.types";

import {
  OpenRouterError,
  chatResponseSchema,
  modelParametersSchema,
  configSchema,
  messageSchema,
} from "./openrouter.types";

import { LogLevel, LOG_LEVEL, LOG_LEVEL_HIERARCHY } from "./logging.types";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly modelName: string;
  private modelParams: ModelParameters;
  private systemMessage?: string;
  private userMessage?: string;
  private readonly _retries: number;
  private readonly _timeout: number;
  private readonly _logger: Console;
  private _lastResponse?: Response;
  private readonly _logLevel: LogLevel;

  // Rate limiting
  private readonly _rateLimitConfig: RateLimitConfig;
  private _rateLimitInfo: RateLimitInfo;

  private readonly _sensitiveFields = [
    "apiKey",
    "Authorization",
    "authorization",
    "key",
    "secret",
    "password",
    "bearer_token",
    "access_token",
    "refresh_token",
    "jwt_token",
  ];

  constructor(config: OpenRouterConfig) {
    // Set up logging first so we can use it during validation
    this._logLevel = config.logLevel || LOG_LEVEL;
    this._logger = console;

    // Validate configuration
    const validatedConfig = configSchema.parse(config);

    // Set up all required fields
    this.apiKey = validatedConfig.apiKey;
    this.modelName = validatedConfig.model;
    this.baseUrl = validatedConfig.baseUrl;
    this._retries = validatedConfig.retries;
    this._timeout = validatedConfig.timeout;

    // Now we can start logging
    this._log(LogLevel.DEBUG, "Initializing OpenRouter service", {
      config: this._sanitizeData(validatedConfig),
    });

    // Set default model parameters
    this.modelParams = modelParametersSchema.parse({
      temperature: 0.7,
      max_tokens: 150,
    });
    this._log(LogLevel.DEBUG, "Default model parameters set", this.modelParams);

    // Initialize rate limiting
    this._rateLimitConfig = validatedConfig.rateLimiting;
    this._rateLimitInfo = {
      requestCount: 0,
      tokenCount: 0,
      lastResetTime: Date.now(),
    };
    this._log(LogLevel.DEBUG, "Rate limiting initialized", {
      config: this._rateLimitConfig,
      info: this._rateLimitInfo,
    });
  }

  // Initialize logger and verify configuration
  public async initialize(): Promise<void> {
    this._log(LogLevel.INFO, "Starting service initialization");
    try {
      // Verify API connection
      this._log(LogLevel.DEBUG, "Verifying API connection", { url: `${this.baseUrl}/health` });
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        this._log(LogLevel.ERROR, "API health check failed", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error("Failed to initialize OpenRouter service");
      }

      this._log(LogLevel.INFO, "OpenRouter service initialized successfully");
    } catch (error) {
      this._log(LogLevel.ERROR, "Service initialization failed", { error });
      throw error;
    }
  }

  // Public methods for message handling
  public setSystemMessage(message: string): void {
    this._log(LogLevel.DEBUG, "Setting system message", { length: message.length });
    const validatedMessage = messageSchema.parse(message);
    this.systemMessage = validatedMessage;
    this._log(LogLevel.DEBUG, "System message set successfully");
  }

  public setUserMessage(message: string): void {
    this._log(LogLevel.DEBUG, "Setting user message", { length: message.length });
    const validatedMessage = messageSchema.parse(message);
    this.userMessage = validatedMessage;
    this._log(LogLevel.DEBUG, "User message set successfully");
  }

  public setModelParameters(params: ModelParameters): void {
    this._log(LogLevel.DEBUG, "Setting model parameters", params);
    const validatedParams = modelParametersSchema.parse(params);
    this.modelParams = {
      ...this.modelParams,
      ...validatedParams,
    };
    this._log(LogLevel.DEBUG, "Model parameters updated", this.modelParams);
  }

  public async callAPI(): Promise<Response> {
    this._log(LogLevel.INFO, "Starting API call");

    // Check rate limits
    await this._checkRateLimits();
    this._log(LogLevel.DEBUG, "Rate limits checked successfully");

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this._retries) {
      try {
        const payload = this._preparePayload();
        this._log(LogLevel.DEBUG, "Request payload prepared", {
          model: payload.model,
          messageCount: payload.messages.length,
          totalTokens: this._estimateTokens(),
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this._timeout);

        this._log(LogLevel.DEBUG, "Sending request", {
          url: `${this.baseUrl}/chat/completions`,
          attempt: attempt + 1,
          timeout: this._timeout,
        });

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = (await response.json()) as APIErrorResponse;
          this._log(LogLevel.ERROR, "API request failed", errorData);
          throw new OpenRouterError(errorData.error.message, errorData.error.type, errorData.error.code);
        }

        // Update rate limit info
        this._updateRateLimits();
        this._log(LogLevel.DEBUG, "Rate limits updated", this._rateLimitInfo);

        this._lastResponse = response;
        this._log(LogLevel.INFO, "API call successful", {
          status: response.status,
          headers: this._sanitizeHeaders(response.headers),
        });
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this._log(LogLevel.ERROR, "API call attempt failed", {
          attempt: attempt + 1,
          error: lastError.message,
        });

        if (error instanceof OpenRouterError) {
          // Don't retry on authentication or validation errors
          if (error.code === "auth_error" || error.code === "validation_error") {
            this._log(LogLevel.ERROR, "Non-retryable error encountered", {
              type: error.type,
              code: error.code,
            });
            throw error;
          }
        }

        attempt++;
        if (attempt < this._retries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          this._log(LogLevel.WARN, "Retrying request", {
            nextAttempt: attempt + 1,
            backoffTime,
          });
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }

    throw this._processError(lastError || new Error("Maximum retry attempts reached"));
  }

  public async getResponse(): Promise<ChatResponse> {
    this._log(LogLevel.DEBUG, "Getting response");

    if (!this._lastResponse) {
      this._log(LogLevel.ERROR, "No API call has been made yet");
      throw new Error("No API call has been made yet");
    }

    try {
      const data = await this._lastResponse.json();
      this._log(LogLevel.DEBUG, "Parsing response data");
      const parsed = chatResponseSchema.parse(data);
      this._log(LogLevel.DEBUG, "Response parsed successfully", {
        choices: parsed.choices.length,
        model: parsed.model,
        usage: parsed.usage,
      });
      return parsed;
    } catch (error) {
      this._log(LogLevel.ERROR, "Failed to parse response", { error });
      throw this._processError(error);
    }
  }

  // Private utility methods
  private _preparePayload(): { model: string; messages: ChatMessage[]; temperature?: number; max_tokens?: number } {
    this._log(LogLevel.DEBUG, "Preparing payload");

    if (!this.userMessage) {
      this._log(LogLevel.ERROR, "User message is required");
      throw new Error("User message is required");
    }

    const messages: ChatMessage[] = [];

    if (this.systemMessage) {
      messages.push({
        role: "system",
        content: this.systemMessage,
      });
    }

    messages.push({
      role: "user",
      content: this.userMessage,
    });

    const payload = {
      model: this.modelName,
      messages,
      ...this.modelParams,
    };

    this._log(LogLevel.DEBUG, "Payload prepared", {
      model: payload.model,
      messageCount: messages.length,
      params: this.modelParams,
    });

    return payload;
  }

  private _processError(error: unknown): OpenRouterError {
    this._log(LogLevel.DEBUG, "Processing error", { error });

    if (error instanceof OpenRouterError) {
      this._log(LogLevel.ERROR, `OpenRouter API Error: ${error.message}`, {
        type: error.type,
        code: error.code,
      });
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    this._log(LogLevel.ERROR, "OpenRouter Service Error:", message);

    return new OpenRouterError(message, "service_error", "unknown_error");
  }

  private async _checkRateLimits(): Promise<void> {
    this._log(LogLevel.DEBUG, "Checking rate limits", this._rateLimitInfo);

    const now = Date.now();
    const minuteInMs = 60 * 1000;

    // Reset counters if a minute has passed
    if (now - this._rateLimitInfo.lastResetTime >= minuteInMs) {
      this._log(LogLevel.DEBUG, "Resetting rate limit counters");
      this._rateLimitInfo = {
        requestCount: 0,
        tokenCount: 0,
        lastResetTime: now,
      };
    }

    // Check limits
    if (this._rateLimitInfo.requestCount >= this._rateLimitConfig.maxRequestsPerMinute) {
      const waitTime = minuteInMs - (now - this._rateLimitInfo.lastResetTime);
      this._log(LogLevel.WARN, "Request rate limit exceeded", {
        current: this._rateLimitInfo.requestCount,
        max: this._rateLimitConfig.maxRequestsPerMinute,
        waitTime,
      });
      throw new OpenRouterError(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        "rate_limit_error",
        "too_many_requests"
      );
    }

    if (this._rateLimitInfo.tokenCount >= this._rateLimitConfig.maxTokensPerMinute) {
      const waitTime = minuteInMs - (now - this._rateLimitInfo.lastResetTime);
      this._log(LogLevel.WARN, "Token rate limit exceeded", {
        current: this._rateLimitInfo.tokenCount,
        max: this._rateLimitConfig.maxTokensPerMinute,
        waitTime,
      });
      throw new OpenRouterError(
        `Token limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        "rate_limit_error",
        "too_many_tokens"
      );
    }

    this._log(LogLevel.DEBUG, "Rate limits check passed");
  }

  private _updateRateLimits(): void {
    this._log(LogLevel.DEBUG, "Updating rate limits", this._rateLimitInfo);

    this._rateLimitInfo.requestCount++;
    const estimatedTokens = this._estimateTokens();
    this._rateLimitInfo.tokenCount += estimatedTokens;

    this._log(LogLevel.DEBUG, "Rate limits updated", {
      newRequestCount: this._rateLimitInfo.requestCount,
      newTokenCount: this._rateLimitInfo.tokenCount,
      addedTokens: estimatedTokens,
    });
  }

  private _estimateTokens(): number {
    const estimatedTokens = Math.ceil((this.systemMessage?.length || 0) / 4 + (this.userMessage?.length || 0) / 4);
    this._log(LogLevel.DEBUG, "Estimated tokens", { estimatedTokens });
    return estimatedTokens;
  }

  private _sanitizeData(data: unknown): unknown {
    if (!data) return data;

    if (typeof data === "string") {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this._sanitizeData(item));
    }

    if (typeof data === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (this._sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
          sanitized[key] = "[REDACTED]";
        } else {
          sanitized[key] = this._sanitizeData(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  private _sanitizeHeaders(headers: Headers): Record<string, string> {
    const sanitizedHeaders: Record<string, string> = {};
    headers.forEach((value, key) => {
      if (this._sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitizedHeaders[key] = "[REDACTED]";
      } else {
        sanitizedHeaders[key] = value;
      }
    });
    return sanitizedHeaders;
  }

  private _log(level: LogLevel, message: string, data?: unknown): void {
    // Only log if the current level is higher or equal to the configured level
    if (LOG_LEVEL_HIERARCHY[level] < LOG_LEVEL_HIERARCHY[this._logLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      service: "OpenRouterService",
      message,
      ...(data ? { data: this._sanitizeData(data) } : {}),
    };

    switch (level) {
      case LogLevel.DEBUG:
        this._logger.debug(JSON.stringify(logData));
        break;
      case LogLevel.INFO:
        this._logger.info(JSON.stringify(logData));
        break;
      case LogLevel.WARN:
        this._logger.warn(JSON.stringify(logData));
        break;
      case LogLevel.ERROR:
        this._logger.error(JSON.stringify(logData));
        break;
    }
  }
}
