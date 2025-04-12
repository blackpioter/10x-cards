import type { GenerateFlashcardsCommand, GenerationCreateResponseDto, FlashcardProposalDto } from "../../types";
import { createHash } from "crypto";
import { supabaseClient } from "../../db/supabase.client";

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

      // Store generation in database
      const { data: generation, error: generationError } = await supabaseClient
        .from("generations")
        .insert({
          user_id: userId,
          source_text_length: command.source_text.length,
          source_text_hash: sourceTextHash,
          generated_count: mockProposals.length,
          accepted_unedited_count: 0,
          accepted_edited_count: 0,
        })
        .select()
        .single();

      if (generationError) {
        throw new Error(`Failed to store generation: ${generationError.message}`);
      }

      // Store flashcard proposals
      const { error: flashcardsError } = await supabaseClient.from("flashcards").insert(
        mockProposals.map((proposal) => ({
          user_id: userId,
          generation_id: generation.id,
          front: proposal.front,
          back: proposal.back,
          source: proposal.source,
          status: "pending",
        }))
      );

      if (flashcardsError) {
        throw new Error(`Failed to store flashcards: ${flashcardsError.message}`);
      }

      // Log successful generation
      console.log(`Successfully generated ${mockProposals.length} flashcards for user: ${userId}`);
      console.log(`Source text hash: ${sourceTextHash}, length: ${command.source_text.length}`);

      return {
        generation_id: generation.id,
        flashcard_proposals: mockProposals,
        generated_count: mockProposals.length,
      };
    } catch (error) {
      // Log error
      console.error("Error generating flashcards:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const flashcardGenerationService = new FlashcardGenerationService();
