import type { GenerateFlashcardsCommand, GenerationCreateResponseDto, FlashcardProposalDto } from "../types";
import { createHash } from "crypto";
import type { SupabaseClient } from "../db/supabase.client";
import { OpenRouterService } from "./openrouter.service";
import { LoggingService } from "./logging.service";
import { createGenerationCacheService } from "./generation-cache.service";

export class GenerationService {
  private openRouterService: OpenRouterService;
  private readonly _logger: LoggingService;
  private readonly _supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }

    this._logger = new LoggingService({ serviceName: "GenerationService" });
    this._supabase = supabase;

    // Initialize OpenRouter service with configuration
    this.openRouterService = new OpenRouterService({
      apiKey,
      model: "openai/gpt-4o-mini",
      baseUrl: "https://openrouter.ai/api/v1",
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
    fromCache,
  }: {
    userId: string;
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
    generationDuration: number;
    fromCache: boolean;
  }) {
    this._logger.debug("Saving generation metadata", {
      userId,
      sourceTextLength: sourceText.length,
      sourceTextHash,
      generatedCount,
      generationDuration,
      fromCache,
    });

    const { data: generation, error: generationError } = await this._supabase
      .from("generations")
      .insert({
        user_id: userId,
        source_text_length: sourceText.length,
        source_text_hash: sourceTextHash,
        generated_count: generatedCount,
        generation_duration: `${generationDuration} milliseconds`,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
        from_cache: fromCache,
      })
      .select()
      .single();

    if (generationError) {
      this._logger.error("Failed to store generation", { error: generationError.message });
      throw new Error(`Failed to store generation: ${generationError.message}`);
    }

    this._logger.info("Successfully saved generation metadata", { generationId: generation.id });
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
    this._logger.debug("Saving flashcard proposals", {
      userId,
      generationId,
      proposalCount: proposals.length,
    });

    const { data: flashcards, error: flashcardsError } = await this._supabase
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
      this._logger.error("Failed to store flashcards", { error: flashcardsError.message });
      throw new Error(`Failed to store flashcards: ${flashcardsError.message}`);
    }

    if (!flashcards) {
      this._logger.error("No flashcards were created");
      throw new Error("No flashcards were created");
    }

    this._logger.info("Successfully saved flashcards", { count: flashcards.length });
    return flashcards;
  }

  private async generateFlashcardsWithAI(sourceText: string, userId: string): Promise<FlashcardProposalDto[]> {
    this._logger.info("Starting AI flashcard generation", { textLength: sourceText.length });

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

    try {
      // Call the API and get response
      await this.openRouterService.callAPI();
      const result = await this.openRouterService.getResponse();

      // Get the content from the first choice's message
      const content = result.choices[0]?.message?.content;
      if (!content) {
        this._logger.error("No content in AI response");
        throw new Error("No content in AI response");
      }

      // Clean up the content by removing any markdown formatting
      const cleanContent = content
        .replace(/^```json\s*/g, "") // Remove opening ```json
        .replace(/^```\s*/g, "") // Remove opening ``` without json
        .replace(/\s*```$/g, "") // Remove closing ```
        .trim(); // Remove any extra whitespace

      let flashcards;
      try {
        flashcards = JSON.parse(cleanContent);
      } catch (parseError: unknown) {
        this._logger.error("Failed to parse JSON response", {
          error: parseError instanceof Error ? parseError.message : String(parseError),
          content: cleanContent,
        });
        throw new Error(
          `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        );
      }

      if (!Array.isArray(flashcards)) {
        this._logger.error("Invalid response format", { content: cleanContent });
        throw new Error("Invalid response format: expected array of flashcards");
      }

      // Validate each flashcard has required properties
      for (const card of flashcards) {
        if (!card.front || !card.back || typeof card.front !== "string" || typeof card.back !== "string") {
          this._logger.error("Invalid flashcard format", { card });
          throw new Error("Invalid flashcard format: missing or invalid front/back properties");
        }
      }

      // Transform and validate the response
      const transformedFlashcards = flashcards.map((card: { front: string; back: string }) => ({
        id: "", // This will be replaced with actual ID after saving to database
        front: card.front,
        back: card.back,
        source: "ai-full" as const,
      }));

      // Cache the generated flashcards
      const cacheService = createGenerationCacheService(this._supabase);
      await cacheService.cacheGeneration(sourceText, transformedFlashcards, userId);

      this._logger.info("Successfully generated flashcards", { count: transformedFlashcards.length });
      return transformedFlashcards;
    } catch (error) {
      this._logger.error("Failed to generate flashcards", {
        error: error instanceof Error ? error.message : String(error),
        raw: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateFlashcards(command: GenerateFlashcardsCommand, userId: string): Promise<GenerationCreateResponseDto> {
    this._logger.info("Starting flashcard generation process", {
      userId,
      textLength: command.source_text.length,
    });

    try {
      // Calculate source text hash for logging
      const sourceTextHash = createHash("sha256").update(command.source_text).digest("hex");
      const startTime = performance.now();

      // Check cache first
      const cacheService = createGenerationCacheService(this._supabase);
      const cachedResult = await cacheService.getCachedGeneration(command.source_text);
      let proposals: FlashcardProposalDto[];
      let fromCache = false;

      if (cachedResult) {
        this._logger.info("Using cached flashcards", {
          fromExactMatch: cachedResult.fromExactMatch,
        });
        proposals = cachedResult.flashcards;
        fromCache = true;
      } else {
        // Generate new flashcards if not in cache
        proposals = await this.generateFlashcardsWithAI(command.source_text, userId);
      }

      const endTime = performance.now();
      const generationDuration = Math.round(endTime - startTime);

      // Store generation metadata
      const generation = await this.saveGenerationMetadata({
        userId,
        sourceText: command.source_text,
        sourceTextHash,
        generatedCount: proposals.length,
        generationDuration,
        fromCache,
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

      this._logger.info("Successfully completed flashcard generation", {
        generationId: generation.id,
        flashcardCount: proposalsWithIds.length,
        duration: generationDuration,
        fromCache,
      });

      return {
        generation_id: generation.id,
        flashcard_proposals: proposalsWithIds,
        generated_count: proposals.length,
      };
    } catch (error) {
      this._logger.error("Error generating flashcards", { error });
      throw error;
    }
  }
}

// Export factory function instead of singleton
export const createGenerationService = (supabase: SupabaseClient) => new GenerationService(supabase);
