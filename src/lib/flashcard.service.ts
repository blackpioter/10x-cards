import { DEFAULT_USER_ID, supabaseClient } from "../db/supabase.client";
import type { FlashcardCreateCommand, FlashcardDto } from "../types";
import { LogLevel } from "./openrouter.service";

// Get log level from environment variable, default to INFO if not set
const LOG_LEVEL = (import.meta.env.LOG_LEVEL || LogLevel.INFO).toLowerCase() as LogLevel;

// Log level hierarchy for filtering
const LOG_LEVEL_HIERARCHY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

const _logger = console;

function _log(level: LogLevel, message: string, data?: unknown): void {
  // Only log if the current level is higher or equal to the configured level
  if (LOG_LEVEL_HIERARCHY[level] < LOG_LEVEL_HIERARCHY[LOG_LEVEL]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    service: "FlashcardService",
    message,
    ...(data ? { data } : {}),
  };

  switch (level) {
    case LogLevel.DEBUG:
      _logger.debug(JSON.stringify(logData));
      break;
    case LogLevel.INFO:
      _logger.info(JSON.stringify(logData));
      break;
    case LogLevel.WARN:
      _logger.warn(JSON.stringify(logData));
      break;
    case LogLevel.ERROR:
      _logger.error(JSON.stringify(logData));
      break;
  }
}

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
  _log(LogLevel.INFO, "Updating flashcards status", {
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
    _log(LogLevel.ERROR, "Error verifying flashcards", { error: verifyError });
    throw new FlashcardsError("Error verifying flashcards", 500);
  }

  if (!existingFlashcards || existingFlashcards.length !== allFlashcardIds.length) {
    _log(LogLevel.ERROR, "Missing flashcards", {
      requested: allFlashcardIds,
      found: existingFlashcards?.map((f) => f.id) || [],
    });
    throw new FlashcardsError("One or more flashcards not found", 404);
  }

  // Update flashcards status in parallel for each status group
  const updatePromises = updates.map(async ({ ids, status }) => {
    _log(LogLevel.DEBUG, "Updating flashcard batch", { status, count: ids.length });

    const { data: updatedFlashcards, error: updateError } = await supabaseClient
      .from("flashcards")
      .update({ status })
      .in("id", ids)
      .eq("user_id", userId)
      .select();

    if (updateError) {
      _log(LogLevel.ERROR, `Error updating flashcards to ${status}`, { error: updateError.message });
      throw new FlashcardsError(`Error updating flashcards to ${status}: ${updateError.message}`, 500);
    }

    return updatedFlashcards;
  });

  try {
    const results = await Promise.all(updatePromises);
    const updatedFlashcards = results.flat().filter((f): f is NonNullable<typeof f> => f !== null);

    if (updatedFlashcards.length === 0) {
      _log(LogLevel.ERROR, "No flashcards updated");
      throw new FlashcardsError("No flashcards updated", 500);
    }

    _log(LogLevel.INFO, "Successfully updated flashcards", {
      count: updatedFlashcards.length,
      byStatus: updates.map((u) => `${u.status}: ${u.ids.length}`),
    });

    return updatedFlashcards;
  } catch (error) {
    _log(LogLevel.ERROR, "Error in batch update", { error });
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
  _log(LogLevel.INFO, "Creating flashcard proposals", {
    count: command.flashcards.length,
    hasGenerationIds: command.flashcards.some((f) => f.generation_id !== null),
  });

  // In development, use the default user ID
  const userId = DEFAULT_USER_ID;

  // Verify all generation_ids exist if provided
  const generationIds = command.flashcards.map((f) => f.generation_id).filter((id): id is string => id !== null);

  if (generationIds.length > 0) {
    _log(LogLevel.DEBUG, "Verifying generation IDs", { generationIds });

    const { data: generations, error: generationsError } = await supabaseClient
      .from("generations")
      .select("id")
      .in("id", generationIds)
      .eq("user_id", userId);

    if (generationsError) {
      _log(LogLevel.ERROR, "Error verifying generations", { error: generationsError });
      throw new FlashcardsError("Error verifying generations", 500);
    }

    if (!generations || generations.length !== new Set(generationIds).size) {
      _log(LogLevel.ERROR, "Missing generations", {
        requested: generationIds,
        found: generations?.map((g) => g.id) || [],
      });
      throw new FlashcardsError("One or more generation_ids not found", 404);
    }
  }

  // Create flashcards in pending state
  _log(LogLevel.DEBUG, "Creating flashcards in database");

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
    _log(LogLevel.ERROR, "Error inserting flashcards", { error: insertError });
    throw new FlashcardsError("Error creating flashcards", 500);
  }

  if (!flashcards) {
    _log(LogLevel.ERROR, "No flashcards created");
    throw new FlashcardsError("No flashcards created", 500);
  }

  _log(LogLevel.INFO, "Successfully created flashcard proposals", {
    count: flashcards.length,
    ids: flashcards.map((f) => f.id),
  });

  return flashcards;
}
