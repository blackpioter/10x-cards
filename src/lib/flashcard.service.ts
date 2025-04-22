import { supabaseClient } from "../db/supabase.client";
import type { FlashcardCreateCommand, FlashcardDto, FlashcardListResponseDto } from "../types";
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
 * @throws {FlashcardsError} with code 401 if user is not authenticated
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function updateFlashcardsStatus(
  updates: { ids: string[]; status: "accepted" | "rejected" | "pending" }[]
): Promise<FlashcardDto[]> {
  _logger.info("Updating flashcards status", {
    updates: updates.map((u) => ({ count: u.ids.length, status: u.status })),
  });

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    _logger.error("Authentication error", { error: authError });
    throw new FlashcardsError("User not authenticated", 401);
  }

  // Get all flashcard IDs being updated
  const allFlashcardIds = updates.flatMap((u) => u.ids);

  // Verify flashcards exist and belong to the user
  const { data: existingFlashcards, error: verifyError } = await supabaseClient
    .from("flashcards")
    .select("id")
    .in("id", allFlashcardIds)
    .eq("user_id", user.id);

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
      .eq("user_id", user.id)
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
 * @throws {FlashcardsError} with code 401 if user is not authenticated
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function createFlashcards(command: FlashcardCreateCommand): Promise<FlashcardDto[]> {
  _logger.info("Creating flashcard proposals", {
    count: command.flashcards.length,
    hasGenerationIds: command.flashcards.some((f) => f.generation_id !== null),
  });

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    _logger.error("Authentication error", { error: authError });
    throw new FlashcardsError("User not authenticated", 401);
  }

  // Verify all generation_ids exist if provided
  const generationIds = command.flashcards.map((f) => f.generation_id).filter((id): id is string => id !== null);

  if (generationIds.length > 0) {
    _logger.debug("Verifying generation IDs", { generationIds });

    const { data: generations, error: generationsError } = await supabaseClient
      .from("generations")
      .select("id")
      .in("id", generationIds)
      .eq("user_id", user.id);

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
        user_id: user.id,
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

/**
 * Retrieves a paginated list of flashcards with optional filtering and sorting.
 *
 * @throws {FlashcardsError} with code 401 if user is not authenticated
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function getFlashcards({
  status,
  sort_by,
  page,
  page_size,
}: {
  status?: "pending" | "accepted" | "rejected";
  sort_by?: "created_at" | "review_count";
  page: number;
  page_size: number;
}): Promise<FlashcardListResponseDto> {
  _logger.info("Fetching flashcards", { status, sort_by, page, page_size });

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    _logger.error("Authentication error", { error: authError });
    throw new FlashcardsError("User not authenticated", 401);
  }

  // Build query
  let query = supabaseClient
    .from("flashcards")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .range((page - 1) * page_size, page * page_size - 1);

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  // Apply sorting
  if (sort_by) {
    query = query.order(sort_by, { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Execute query
  const { data: flashcards, error: fetchError, count } = await query;

  if (fetchError) {
    _logger.error("Error fetching flashcards", { error: fetchError });
    throw new FlashcardsError("Error fetching flashcards", 500);
  }

  if (!flashcards || !count) {
    return {
      data: [],
      pagination: {
        total: 0,
        page,
        limit: page_size,
      },
    };
  }

  _logger.info("Successfully fetched flashcards", {
    count: flashcards.length,
    total: count,
    page,
  });

  return {
    data: flashcards,
    pagination: {
      total: count,
      page,
      limit: page_size,
    },
  };
}

/**
 * Updates a single flashcard.
 *
 * @throws {FlashcardsError} with code 404 if flashcard doesn't exist
 * @throws {FlashcardsError} with code 401 if user is not authenticated
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function updateFlashcard(id: string, data: Partial<FlashcardDto>): Promise<FlashcardDto> {
  _logger.info("Updating flashcard", { id, data });

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    _logger.error("Authentication error", { error: authError });
    throw new FlashcardsError("User not authenticated", 401);
  }

  // Update flashcard
  const { data: flashcard, error: updateError } = await supabaseClient
    .from("flashcards")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) {
    _logger.error("Error updating flashcard", { error: updateError });
    if (updateError.code === "PGRST116") {
      throw new FlashcardsError("Flashcard not found", 404);
    }
    throw new FlashcardsError("Error updating flashcard", 500);
  }

  if (!flashcard) {
    _logger.error("No flashcard updated");
    throw new FlashcardsError("No flashcard updated", 500);
  }

  _logger.info("Successfully updated flashcard", { id: flashcard.id });

  return flashcard;
}

/**
 * Deletes a single flashcard.
 *
 * @throws {FlashcardsError} with code 404 if flashcard doesn't exist
 * @throws {FlashcardsError} with code 401 if user is not authenticated
 * @throws {FlashcardsError} with code 500 for other errors
 */
export async function deleteFlashcard(id: string): Promise<void> {
  _logger.info("Deleting flashcard", { id });

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    _logger.error("Authentication error", { error: authError });
    throw new FlashcardsError("User not authenticated", 401);
  }

  // Delete flashcard
  const { error: deleteError } = await supabaseClient.from("flashcards").delete().eq("id", id).eq("user_id", user.id);

  if (deleteError) {
    _logger.error("Error deleting flashcard", { error: deleteError });
    if (deleteError.code === "PGRST116") {
      throw new FlashcardsError("Flashcard not found", 404);
    }
    throw new FlashcardsError("Error deleting flashcard", 500);
  }

  _logger.info("Successfully deleted flashcard", { id });
}
