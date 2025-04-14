import type { SupabaseClient } from "../db/supabase.client";
import type { FlashcardCreateCommand, FlashcardDto } from "../types";

export class FlashcardsError extends Error {
  constructor(message: string, public code: number = 500) {
    super(message);
    this.name = "FlashcardsError";
  }
}

/**
 * Creates one or more flashcards in a single transaction.
 * Verifies generation_id existence if provided.
 *
 * @throws {FlashcardsError} with code 404 if generation_id doesn't exist
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function createFlashcards(
  supabase: SupabaseClient,
  command: FlashcardCreateCommand
): Promise<FlashcardDto[]> {
  console.log("[FlashcardService] Creating flashcards:", {
    count: command.flashcards.length,
    hasGenerationIds: command.flashcards.some(f => f.generation_id !== null)
  });

  // Start a transaction
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    console.error("[FlashcardService] User not authenticated");
    throw new FlashcardsError("User not authenticated", 401);
  }

  // Verify all generation_ids exist if provided
  const generationIds = command.flashcards
    .map((f) => f.generation_id)
    .filter((id): id is string => id !== null);

  if (generationIds.length > 0) {
    console.log("[FlashcardService] Verifying generation IDs:", generationIds);

    const { data: generations, error: generationsError } = await supabase
      .from("generations")
      .select("id")
      .in("id", generationIds)
      .eq("user_id", user.id);

    if (generationsError) {
      console.error("[FlashcardService] Error verifying generations:", generationsError);
      throw new FlashcardsError("Error verifying generations", 500);
    }

    if (!generations || generations.length !== new Set(generationIds).size) {
      console.error("[FlashcardService] Missing generations:", {
        requested: generationIds,
        found: generations?.map(g => g.id) || []
      });
      throw new FlashcardsError("One or more generation_ids not found", 404);
    }
  }

  // Create flashcards in a transaction
  console.log("[FlashcardService] Creating flashcards in database");

  const { data: flashcards, error: insertError } = await supabase
    .from("flashcards")
    .insert(
      command.flashcards.map((f) => ({
        ...f,
        user_id: user.id,
      }))
    )
    .select();

  if (insertError) {
    console.error("[FlashcardService] Error inserting flashcards:", insertError);
    throw new FlashcardsError("Error creating flashcards", 500);
  }

  if (!flashcards) {
    console.error("[FlashcardService] No flashcards created");
    throw new FlashcardsError("No flashcards created", 500);
  }

  console.log("[FlashcardService] Successfully created flashcards:", {
    count: flashcards.length,
    ids: flashcards.map(f => f.id)
  });

  return flashcards;
}
