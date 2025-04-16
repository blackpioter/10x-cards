import { z } from "zod";

// Response schema validation
export const chatResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
      finish_reason: z.string().nullable(),
    })
  ),
  model: z.string(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
});

// Input validation schemas
export const modelParametersSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(4096).optional(),
});

// Rate limiting validation
export const rateLimitConfigSchema = z.object({
  maxRequestsPerMinute: z.number().min(1).max(100),
  maxTokensPerMinute: z.number().min(1000).max(100000),
});

// OpenRouter model validation
export const openRouterModelSchema = z.string().refine(
  (model) => {
    const validPrefixes = ["openai/", "anthropic/", "google/", "meta/", "mistral/", "openrouter/"];
    return validPrefixes.some((prefix) => model.startsWith(prefix));
  },
  {
    message:
      "Model name must start with a valid provider prefix (openai/, anthropic/, google/, meta/, mistral/, openrouter/)",
  }
);

// Enhanced config schema
export const configSchema = z.object({
  // Connection settings
  baseUrl: z.string().url().optional().default("https://openrouter.ai/api/v1"),
  apiKey: z.string().min(32).max(256),
  model: openRouterModelSchema.default("openai/gpt-4"),

  // Request settings
  retries: z.number().min(1).max(5).optional().default(3),
  timeout: z.number().min(1000).max(60000).optional().default(30000),

  // Rate limiting settings
  rateLimiting: rateLimitConfigSchema.optional().default({
    maxRequestsPerMinute: 60,
    maxTokensPerMinute: 40000,
  }),

  // Debug settings
  debug: z.boolean().optional().default(false),
});

export const messageSchema = z.string().min(1).max(10000);

export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type ModelParameters = z.infer<typeof modelParametersSchema>;
export type OpenRouterConfig = z.infer<typeof configSchema>;
export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface APIErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly type: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export interface RateLimitInfo {
  requestCount: number;
  tokenCount: number;
  lastResetTime: number;
}
