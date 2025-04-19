import { DEFAULT_USER_ID, supabaseClient } from "../db/supabase.client";
import type { FlashcardCreateCommand, FlashcardDto } from "../types";
import { LoggingService } from "./logging.service";

const _logger = new LoggingService({ serviceName: "FlashcardService" });

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
 * Allows updating different flashcards with different statuses in a single operation.
 *
 * @throws {FlashcardsError} with code 404 if any flashcard doesn't exist
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function updateFlashcardsStatus(
  updates: { ids: string[]; status: "accepted" | "rejected" | "pending" }[]
): Promise<FlashcardDto[]> {
  _logger.info("Updating flashcards status", {
    updates: updates.map((u) => ({ count: u.ids.length, status: u.status })),
  });

  // In development, use the default user ID
  const userId = DEFAULT_USER_ID;

  // Get all flashcard IDs being updated
  const allFlashcardIds = updates.flatMap((u) => u.ids);

  // Verify flashcards exist and belong to the user
  const { data: existingFlashcards, error: verifyError } = await supabaseClient
    .from("flashcards")
    .select("id")
    .in("id", allFlashcardIds)
    .eq("user_id", userId);

  if (verifyError) {
    _logger.error("Error verifying flashcards", { error: verifyError });
    throw new FlashcardsError("Error verifying flashcards", 500);
  }

  if (!existingFlashcards || existingFlashcards.length !== allFlashcardIds.length) {
    _logger.error("Missing flashcards", {
      requested: allFlashcardIds,
      found: existingFlashcards?.map((f) => f.id) || [],
    });
    throw new FlashcardsError("One or more flashcards not found", 404);
  }

  // Update flashcards status in parallel for each status group
  const updatePromises = updates.map(async ({ ids, status }) => {
    _logger.debug("Updating flashcard batch", { status, count: ids.length });

    const { data: updatedFlashcards, error: updateError } = await supabaseClient
      .from("flashcards")
      .update({ status })
      .in("id", ids)
      .eq("user_id", userId)
      .select();

    if (updateError) {
      _logger.error(`Error updating flashcards to ${status}`, { error: updateError.message });
      throw new FlashcardsError(`Error updating flashcards to ${status}: ${updateError.message}`, 500);
    }

    return updatedFlashcards;
  });

  try {
    const results = await Promise.all(updatePromises);
    const updatedFlashcards = results.flat().filter((f): f is NonNullable<typeof f> => f !== null);

    if (updatedFlashcards.length === 0) {
      _logger.error("No flashcards updated");
      throw new FlashcardsError("No flashcards updated", 500);
    }

    _logger.info("Successfully updated flashcards", {
      count: updatedFlashcards.length,
      byStatus: updates.map((u) => `${u.status}: ${u.ids.length}`),
    });

    return updatedFlashcards;
  } catch (error) {
    _logger.error("Error in batch update", { error });
    throw error instanceof FlashcardsError ? error : new FlashcardsError("Error updating flashcards", 500);
  }
}

/**
 * Creates new flashcards in pending state.
 * Used only for initial creation of AI-generated flashcard proposals.
 *
 * @throws {FlashcardsError} with code 404 if generation_id doesn't exist
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function createFlashcards(command: FlashcardCreateCommand): Promise<FlashcardDto[]> {
  _logger.info("Creating flashcard proposals", {
    count: command.flashcards.length,
    hasGenerationIds: command.flashcards.some((f) => f.generation_id !== null),
  });

  // In development, use the default user ID
  const userId = DEFAULT_USER_ID;

  // Verify all generation_ids exist if provided
  const generationIds = command.flashcards.map((f) => f.generation_id).filter((id): id is string => id !== null);

  if (generationIds.length > 0) {
    _logger.debug("Verifying generation IDs", { generationIds });

    const { data: generations, error: generationsError } = await supabaseClient
      .from("generations")
      .select("id")
      .in("id", generationIds)
      .eq("user_id", userId);

    if (generationsError) {
      _logger.error("Error verifying generations", { error: generationsError });
      throw new FlashcardsError("Error verifying generations", 500);
    }

    if (!generations || generations.length !== new Set(generationIds).size) {
      _logger.error("Missing generations", {
        requested: generationIds,
        found: generations?.map((g) => g.id) || [],
      });
      throw new FlashcardsError("One or more generation_ids not found", 404);
    }
  }

  // Create flashcards in pending state
  _logger.debug("Creating flashcards in database");

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
    _logger.error("Error inserting flashcards", { error: insertError });
    throw new FlashcardsError("Error creating flashcards", 500);
  }

  if (!flashcards) {
    _logger.error("No flashcards created");
    throw new FlashcardsError("No flashcards created", 500);
  }

  _logger.info("Successfully created flashcard proposals", {
    count: flashcards.length,
    ids: flashcards.map((f) => f.id),
  });

  return flashcards;
}
