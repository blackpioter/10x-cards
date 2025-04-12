import type { GenerateFlashcardsCommand, GenerationCreateResponseDto, FlashcardProposalDto } from "../types";
import { createHash } from "crypto";
import { supabaseClient } from "../db/supabase.client";

export class GenerationService {
  private async saveGenerationMetadata({
    userId,
    sourceText,
    sourceTextHash,
    generatedCount,
  }: {
    userId: string;
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
  }) {
    const { data: generation, error: generationError } = await supabaseClient
      .from("generations")
      .insert({
        user_id: userId,
        source_text_length: sourceText.length,
        source_text_hash: sourceTextHash,
        generated_count: generatedCount,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
      })
      .select()
      .single();

    if (generationError) {
      throw new Error(`Failed to store generation: ${generationError.message}`);
    }

    return generation;
  }

  private async saveFlashcards({
    userId,
    generationId,
    proposals,
  }: {
    userId: string;
    generationId: string;
    proposals: FlashcardProposalDto[];
  }) {
    const { error: flashcardsError } = await supabaseClient.from("flashcards").insert(
      proposals.map((proposal) => ({
        user_id: userId,
        generation_id: generationId,
        front: proposal.front,
        back: proposal.back,
        source: proposal.source,
        status: "pending",
      }))
    );

    if (flashcardsError) {
      throw new Error(`Failed to store flashcards: ${flashcardsError.message}`);
    }
  }

  private async callAIService(sourceText: string): Promise<FlashcardProposalDto[]> {
    // Mock implementation - using first 50 chars of source text as a mock front
    const previewText = sourceText.slice(0, 50);

    // In the future, this will call the actual AI service
    return [
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
  }

  async generateFlashcards(command: GenerateFlashcardsCommand, userId: string): Promise<GenerationCreateResponseDto> {
    try {
      // Calculate source text hash for logging
      const sourceTextHash = createHash("sha256").update(command.source_text).digest("hex");

      // Generate flashcard proposals using AI
      const proposals = await this.callAIService(command.source_text);

      // Store generation metadata
      const generation = await this.saveGenerationMetadata({
        userId,
        sourceText: command.source_text,
        sourceTextHash,
        generatedCount: proposals.length,
      });

      // Store flashcard proposals
      await this.saveFlashcards({
        userId,
        generationId: generation.id,
        proposals,
      });

      // Log successful generation
      console.log(`Successfully generated ${proposals.length} flashcards for user: ${userId}`);
      console.log(`Source text hash: ${sourceTextHash}, length: ${command.source_text.length}`);

      return {
        generation_id: generation.id,
        flashcard_proposals: proposals,
        generated_count: proposals.length,
      };
    } catch (error) {
      // Log error
      console.error("Error generating flashcards:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const flashcardGenerationService = new GenerationService();
