import type { GenerateFlashcardsCommand, GenerationCreateResponseDto, FlashcardProposalDto } from "../../types";
import { loggingService } from "./loggingService";
import { createHash } from "crypto";

export class FlashcardGenerationService {
  async generateFlashcards(command: GenerateFlashcardsCommand, userId: string): Promise<GenerationCreateResponseDto> {
    try {
      // Calculate source text hash for logging
      const sourceTextHash = createHash("sha256").update(command.source_text).digest("hex");

      // Mock implementation - using first 50 chars of source text as a mock front
      const previewText = command.source_text.slice(0, 50);

      const mockProposals: FlashcardProposalDto[] = [
        {
          front: `Sample question about: ${previewText}...`,
          back: "Mock answer 1",
          source: "ai-full",
        },
        {
          front: "What is the largest planet in our solar system?",
          back: "Jupiter",
          source: "ai-full",
        },
        {
          front: "Who wrote 'Romeo and Juliet'?",
          back: "William Shakespeare",
          source: "ai-full",
        },
      ];

      // Log successful generation
      console.log(`Successfully generated ${mockProposals.length} flashcards for user: ${userId}`);
      console.log(`Source text hash: ${sourceTextHash}, length: ${command.source_text.length}`);

      return {
        generation_id: Math.floor(Math.random() * 1000),
        flashcard_proposals: mockProposals,
        generated_count: mockProposals.length,
      };
    } catch (error) {
      // Log error with details
      await loggingService.logGenerationError({
        userId,
        errorCode: "GENERATION_FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error during generation",
        model: "mock-model",
        sourceTextHash: createHash("sha256").update(command.source_text).digest("hex"),
        sourceTextLength: command.source_text.length,
      });

      throw error;
    }
  }
}

// Export singleton instance
export const flashcardGenerationService = new FlashcardGenerationService();
