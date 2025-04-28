import { createHash } from "crypto";
import type { SupabaseClient } from "../db/supabase.client";
import { LoggingService } from "./logging.service";
import type { FlashcardProposalDto } from "../types";
import type { Json } from "../db/database.types";

export class GenerationCacheService {
  private readonly _logger: LoggingService;
  private readonly SIMILARITY_THRESHOLD = 0.85; // 85% similarity threshold
  private readonly CACHE_EXPIRY_DAYS = 30; // Cache entries expire after 30 days
  private readonly _supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this._logger = new LoggingService({ serviceName: "GenerationCacheService" });
    this._supabase = supabase;
  }

  private calculateHash(text: string): string {
    return createHash("sha256").update(text).digest("hex");
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Implement Levenshtein distance for similarity calculation
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  async getCachedGeneration(sourceText: string): Promise<{
    flashcards: FlashcardProposalDto[];
    fromExactMatch: boolean;
  } | null> {
    const textHash = this.calculateHash(sourceText);
    this._logger.debug("Looking for cached generation", { textHash });

    // First try exact match
    const { data: exactMatch } = await this._supabase
      .from("generation_cache")
      .select("id, source_text, flashcards, created_at")
      .eq("text_hash", textHash)
      .single();

    if (exactMatch) {
      this._logger.info("Found exact cache match", { cacheId: exactMatch.id });
      const flashcards = exactMatch.flashcards as unknown as FlashcardProposalDto[];
      return {
        flashcards,
        fromExactMatch: true,
      };
    }

    // If no exact match, try similarity matching
    const { data: recentGenerations } = await this._supabase
      .from("generation_cache")
      .select("id, source_text, flashcards, created_at")
      .gte("created_at", new Date(Date.now() - this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString());

    if (!recentGenerations?.length) return null;

    // Find most similar text
    let bestMatch = null;
    let highestSimilarity = 0;

    for (const gen of recentGenerations) {
      const similarity = this.calculateSimilarity(sourceText, gen.source_text);
      if (similarity > highestSimilarity && similarity >= this.SIMILARITY_THRESHOLD) {
        highestSimilarity = similarity;
        bestMatch = gen;
      }
    }

    if (bestMatch) {
      this._logger.info("Found similar cache match", {
        cacheId: bestMatch.id,
        similarity: highestSimilarity,
      });
      const flashcards = bestMatch.flashcards as unknown as FlashcardProposalDto[];
      return {
        flashcards,
        fromExactMatch: false,
      };
    }

    return null;
  }

  async cacheGeneration(sourceText: string, flashcards: FlashcardProposalDto[], userId: string): Promise<void> {
    const textHash = this.calculateHash(sourceText);
    this._logger.debug("Caching generation result", {
      textHash,
      flashcardsCount: flashcards.length,
      userId,
    });

    const { error } = await this._supabase.from("generation_cache").insert({
      text_hash: textHash,
      source_text: sourceText,
      flashcards: flashcards as unknown as Json,
      created_at: new Date().toISOString(),
      user_id: userId,
    });

    if (error) {
      this._logger.error("Failed to cache generation", { error: error.message });
      throw new Error(`Failed to cache generation: ${error.message}`);
    }

    this._logger.info("Successfully cached generation result");
  }
}

// No longer export a singleton instance since we need per-request clients
export const createGenerationCacheService = (supabase: SupabaseClient) => new GenerationCacheService(supabase);
