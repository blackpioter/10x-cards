import { DEFAULT_USER_ID, supabaseClient } from "../db/supabase.client";
import type { FlashcardCreateCommand, FlashcardDto } from "../types";

export class FlashcardsError extends Error {
  constructor(
    message: string,
    public code = 500
  ) {
    super(message);
    this.name = "FlashcardsError";
  }
}

/**
 * Updates status of existing flashcards.
 *
 * @throws {FlashcardsError} with code 404 if any flashcard doesn't exist
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function updateFlashcardsStatus(
  flashcardIds: string[],
  status: "accepted" | "rejected"
): Promise<FlashcardDto[]> {
  console.log("[FlashcardService] Updating flashcards status:", {
    count: flashcardIds.length,
    status,
  });

  // In development, use the default user ID
  const userId = DEFAULT_USER_ID;

  // Verify flashcards exist and belong to the user
  const { data: existingFlashcards, error: verifyError } = await supabaseClient
    .from("flashcards")
    .select("id")
    .in("id", flashcardIds)
    .eq("user_id", userId);

  if (verifyError) {
    console.error("[FlashcardService] Error verifying flashcards:", verifyError);
    throw new FlashcardsError("Error verifying flashcards", 500);
  }

  if (!existingFlashcards || existingFlashcards.length !== flashcardIds.length) {
    console.error("[FlashcardService] Missing flashcards:", {
      requested: flashcardIds,
      found: existingFlashcards?.map((f) => f.id) || [],
    });
    throw new FlashcardsError("One or more flashcards not found", 404);
  }

  // Update flashcards status
  const { data: updatedFlashcards, error: updateError } = await supabaseClient
    .from("flashcards")
    .update({ status })
    .in("id", flashcardIds)
    .eq("user_id", userId)
    .select();

  if (updateError) {
    console.error("[FlashcardService] Error updating flashcards:", updateError);
    throw new FlashcardsError("Error updating flashcards", 500);
  }

  if (!updatedFlashcards) {
    console.error("[FlashcardService] No flashcards updated");
    throw new FlashcardsError("No flashcards updated", 500);
  }

  console.log("[FlashcardService] Successfully updated flashcards:", {
    count: updatedFlashcards.length,
    ids: updatedFlashcards.map((f) => f.id),
  });

  return updatedFlashcards;
}

/**
 * Creates new flashcards in pending state.
 * Used only for initial creation of AI-generated flashcard proposals.
 *
 * @throws {FlashcardsError} with code 404 if generation_id doesn't exist
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function createFlashcards(command: FlashcardCreateCommand): Promise<FlashcardDto[]> {
  console.log("[FlashcardService] Creating flashcard proposals:", {
    count: command.flashcards.length,
    hasGenerationIds: command.flashcards.some((f) => f.generation_id !== null),
  });

  // In development, use the default user ID
  const userId = DEFAULT_USER_ID;

  // Verify all generation_ids exist if provided
  const generationIds = command.flashcards.map((f) => f.generation_id).filter((id): id is string => id !== null);

  if (generationIds.length > 0) {
    console.log("[FlashcardService] Verifying generation IDs:", generationIds);

    const { data: generations, error: generationsError } = await supabaseClient
      .from("generations")
      .select("id")
      .in("id", generationIds)
      .eq("user_id", userId);

    if (generationsError) {
      console.error("[FlashcardService] Error verifying generations:", generationsError);
      throw new FlashcardsError("Error verifying generations", 500);
    }

    if (!generations || generations.length !== new Set(generationIds).size) {
      console.error("[FlashcardService] Missing generations:", {
        requested: generationIds,
        found: generations?.map((g) => g.id) || [],
      });
      throw new FlashcardsError("One or more generation_ids not found", 404);
    }
  }

  // Create flashcards in pending state
  console.log("[FlashcardService] Creating flashcards in database");

  const { data: flashcards, error: insertError } = await supabaseClient
    .from("flashcards")
    .insert(
      command.flashcards.map((f) => ({
        ...f,
        user_id: userId,
        status: "pending",
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

  console.log("[FlashcardService] Successfully created flashcard proposals:", {
    count: flashcards.length,
    ids: flashcards.map((f) => f.id),
  });

  return flashcards;
}
