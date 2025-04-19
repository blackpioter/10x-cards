import type { GenerateFlashcardsCommand, GenerationCreateResponseDto, FlashcardProposalDto } from "../types";
import { createHash } from "crypto";
import { supabaseClient } from "../db/supabase.client";
import { OpenRouterService } from "./openrouter.service";

export class GenerationService {
  private openRouterService: OpenRouterService;

  constructor() {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }

    // Initialize OpenRouter service with configuration
    this.openRouterService = new OpenRouterService({
      apiKey,
      model: "openai/gpt-4o-mini",
      baseUrl: "https://openrouter.ai/api/v1",
      debug: import.meta.env.DEV,
      retries: 2,
      timeout: 60000, // 1 minute (maximum allowed)
      rateLimiting: {
        maxRequestsPerMinute: 10,
        maxTokensPerMinute: 10000,
      },
    });
  }

  private async saveGenerationMetadata({
    userId,
    sourceText,
    sourceTextHash,
    generatedCount,
    generationDuration,
  }: {
    userId: string;
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
    generationDuration: number; // duration in milliseconds
  }) {
    const { data: generation, error: generationError } = await supabaseClient
      .from("generations")
      .insert({
        user_id: userId,
        source_text_length: sourceText.length,
        source_text_hash: sourceTextHash,
        generated_count: generatedCount,
        generation_duration: `${generationDuration} milliseconds`, // PostgreSQL interval format
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
    const { data: flashcards, error: flashcardsError } = await supabaseClient
      .from("flashcards")
      .insert(
        proposals.map((proposal) => ({
          user_id: userId,
          generation_id: generationId,
          front: proposal.front,
          back: proposal.back,
          source: proposal.source,
          status: "pending",
        }))
      )
      .select();

    if (flashcardsError) {
      throw new Error(`Failed to store flashcards: ${flashcardsError.message}`);
    }

    if (!flashcards) {
      throw new Error("No flashcards were created");
    }

    return flashcards;
  }

  private async generateFlashcardsWithAI(sourceText: string): Promise<FlashcardProposalDto[]> {
    // Initialize OpenRouter if not already done
    await this.openRouterService.initialize();

    // Set system message to explain the task
    this.openRouterService.setSystemMessage(
      `You are an expert at creating high-quality flashcards from educational content.
      Your task is to analyze the provided text and create a set of flashcards that:
      1. Cover the key concepts and important details
      2. Are clear and concise
      3. Use question-answer format
      4. Avoid overly complex or compound questions
      5. Are self-contained (answers should be complete)

      Format your response as a JSON array of flashcard objects with 'front' and 'back' properties.
      Return ONLY the JSON array, without any markdown formatting or explanation.
      Example:
      [
        {
          "front": "What is photosynthesis?",
          "back": "The process by which plants convert sunlight, water, and CO2 into glucose and oxygen"
        }
      ]`
    );

    // Set the source text as user message
    this.openRouterService.setUserMessage(sourceText);

    // Configure model parameters for flashcard generation
    this.openRouterService.setModelParameters({
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Call the API and get response
    await this.openRouterService.callAPI();
    const result = await this.openRouterService.getResponse();

    try {
      // Get the content from the first choice's message
      const content = result.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in AI response");
      }

      // Clean up the content by removing any markdown formatting
      const cleanContent = content
        .replace(/^```json\s*/g, "") // Remove opening ```json
        .replace(/^```\s*/g, "") // Remove opening ``` without json
        .replace(/\s*```$/g, "") // Remove closing ```
        .trim(); // Remove any extra whitespace

      const flashcards = JSON.parse(cleanContent);
      if (!Array.isArray(flashcards)) {
        throw new Error("Invalid response format: expected array of flashcards");
      }

      // Transform and validate the response
      return flashcards.map((card: { front: string; back: string }) => ({
        id: "", // This will be replaced with actual ID after saving to database
        front: card.front,
        back: card.back,
        source: "ai-full" as const,
      }));
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      if (error instanceof SyntaxError) {
        console.error("Raw content:", result.choices[0]?.message?.content);
      }
      throw new Error("Failed to generate valid flashcards from AI response");
    }
  }

  async generateFlashcards(command: GenerateFlashcardsCommand, userId: string): Promise<GenerationCreateResponseDto> {
    try {
      // Calculate source text hash for logging
      const sourceTextHash = createHash("sha256").update(command.source_text).digest("hex");

      // Generate flashcard proposals using AI and measure duration
      const startTime = performance.now();
      const proposals = await this.generateFlashcardsWithAI(command.source_text);
      const endTime = performance.now();
      const generationDuration = Math.round(endTime - startTime);

      // Store generation metadata
      const generation = await this.saveGenerationMetadata({
        userId,
        sourceText: command.source_text,
        sourceTextHash,
        generatedCount: proposals.length,
        generationDuration,
      });

      // Store flashcard proposals and get their IDs
      const savedFlashcards = await this.saveFlashcards({
        userId,
        generationId: generation.id,
        proposals,
      });

      // Map saved flashcards to proposals with IDs
      const proposalsWithIds = savedFlashcards.map((flashcard) => ({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source as "ai-full" | "ai-edited",
      }));

      // Log successful generation
      console.log(`Successfully generated ${proposals.length} flashcards for user: ${userId}`);
      console.log(`Source text hash: ${sourceTextHash}, length: ${command.source_text.length}`);
      console.log(`Generation duration: ${generationDuration}ms`);

      return {
        generation_id: generation.id,
        flashcard_proposals: proposalsWithIds,
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
export const generationService = new GenerationService();
