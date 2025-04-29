import { LogLevel, LOG_LEVEL, LOG_LEVEL_HIERARCHY } from "./logging.types";

export interface LoggerConfig {
  serviceName: string;
  logger?: Console;
  sensitiveKeys?: string[];
}

// Default sensitive keys with more precise authorization token definitions
const DEFAULT_SENSITIVE_KEYS = [
  "password",
  "auth_token",
  "authToken",
  "apiKey",
  "api_key",
  "Authorization",
  "authorization",
  "bearer_token",
  "bearerToken",
  "access_token",
  "accessToken",
  "refresh_token",
  "refreshToken",
  "jwt_token",
  "jwtToken",
  "secret",
  "auth",
  "api_secret",
  "apiSecret",
  "private_key",
  "privateKey",
  "credential",
];

/**
 * Safe JSON stringify with basic sanitization
 */
function safeStringify(obj: unknown, sensitiveKeys: string[] = []): string {
  return JSON.stringify(obj, (key, value) => {
    // Mask sensitive data
    if (isSensitiveKey(key, sensitiveKeys)) {
      return "[REDACTED]";
    }

    // Handle functions
    if (typeof value === "function") {
      return "[Function]";
    }

    return value;
  });
}

/**
 * Checks if a key contains sensitive data
 */
function isSensitiveKey(key: string, sensitiveKeys: string[]): boolean {
  const lowerKey = key.toLowerCase();
  return sensitiveKeys.some((pattern) => lowerKey.includes(pattern));
}

export class LoggingService {
  private readonly _logger: Console;
  private readonly _serviceName: string;
  private readonly _sensitiveKeys: string[];

  constructor(config: LoggerConfig) {
    this._logger = config.logger || console;
    this._serviceName = config.serviceName;
    const configKeys = config.sensitiveKeys || [];
    this._sensitiveKeys = [...configKeys, ...DEFAULT_SENSITIVE_KEYS].map((k) => k.toLowerCase());
  }

  /**
   * Sanitizes data by masking sensitive information
   */
  public sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== "object") {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = isSensitiveKey(key, this._sensitiveKeys) ? "[REDACTED]" : this.sanitizeData(value);
    }

    return sanitized;
  }

  /**
   * Sanitizes HTTP headers
   */
  public sanitizeHeaders(headers: Headers | Record<string, string>): Record<string, string> {
    const entries = headers instanceof Headers ? Array.from(headers.entries()) : Object.entries(headers);

    return Object.fromEntries(
      entries.map(([key, value]) => [key, isSensitiveKey(key, this._sensitiveKeys) ? "[REDACTED]" : value])
    );
  }

  public log(level: LogLevel, message: string, data?: unknown): void {
    if (LOG_LEVEL_HIERARCHY[level] < LOG_LEVEL_HIERARCHY[LOG_LEVEL]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      service: this._serviceName,
      message,
      ...(data ? { data: this.sanitizeData(data) } : {}),
    };

    const safeLogData = safeStringify(logData, this._sensitiveKeys);

    switch (level) {
      case LogLevel.DEBUG:
        this._logger.debug(safeLogData);
        break;
      case LogLevel.INFO:
        this._logger.info(safeLogData);
        break;
      case LogLevel.WARN:
        this._logger.warn(safeLogData);
        break;
      case LogLevel.ERROR:
        this._logger.error(safeLogData);
        break;
    }
  }

  // Convenience methods
  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  public error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data);
  }
}
