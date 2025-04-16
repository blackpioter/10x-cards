import { z } from "zod";

// Response schema validation
export const chatResponseSchema = z.object({
  answer: z.string(),
  references: z.array(z.unknown()),
});

// Input validation schemas
export const modelParametersSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(4096).optional(),
});

export const configSchema = z.object({
  baseUrl: z.string().url().optional(),
  retries: z.number().min(1).max(5).optional(),
  timeout: z.number().min(1000).max(60000).optional(),
});

export const messageSchema = z.string().min(1).max(4096);

export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type ModelParameters = z.infer<typeof modelParametersSchema>;
export type OpenRouterConfig = z.infer<typeof configSchema>;

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

// Rate limiting types
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
}

export interface RateLimitInfo {
  requestCount: number;
  tokenCount: number;
  lastResetTime: number;
}
