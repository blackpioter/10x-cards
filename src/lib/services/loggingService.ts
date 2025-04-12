import { supabaseClient } from "../../db/supabase.client";

export class LoggingService {
  async logGenerationError({
    userId,
    errorCode,
    errorMessage,
    model,
    sourceTextHash,
    sourceTextLength,
  }: {
    userId: string;
    errorCode: string;
    errorMessage: string;
    model: string;
    sourceTextHash: string;
    sourceTextLength: number;
  }) {
    try {
      const { error } = await supabaseClient.from("generation_error_logs").insert({
        user_id: userId,
        error_code: errorCode,
        error_message: errorMessage,
        model,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
      });

      if (error) {
        console.error("Failed to log generation error:", error);
      }
    } catch (error) {
      console.error("Error while logging generation error:", error);
    }
  }
}

// Export singleton instance
export const loggingService = new LoggingService();
