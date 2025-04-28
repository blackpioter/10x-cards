import { LoggingService } from "./logging.service";
import type { SupabaseClient } from "../db/supabase.client";
import type {
  FlashcardCreateCommand,
  FlashcardDto,
  FlashcardListResponseDto,
  FlashcardReviewDto,
  FlashcardActionStatus,
} from "../types";

export class FlashcardsError extends Error {
  constructor(
    message: string,
    public code = 500
  ) {
    super(message);
    this.name = "FlashcardsError";
  }
}

export class FlashcardService {
  private readonly _logger: LoggingService;

  constructor(private readonly _supabaseClient: SupabaseClient) {
    this._logger = new LoggingService({ serviceName: "FlashcardService" });
  }

  /**
   * Updates status of existing flashcards.
   * Allows updating different flashcards with different statuses in a single operation.
   *
   * @throws {FlashcardsError} with code 404 if any flashcard doesn't exist
   * @throws {FlashcardsError} with code 401 if user is not authenticated
   * @throws {FlashcardsError} with code 500 for other errors
   */
  async updateFlashcardsStatus(
    updates: { ids: string[]; status: FlashcardActionStatus }[],
    user_id: string
  ): Promise<FlashcardDto[]> {
    this._logger.info("Updating flashcards status", {
      updates: updates.map((u) => ({ count: u.ids.length, status: u.status })),
    });

    // Get all flashcard IDs being updated
    const allFlashcardIds = updates.flatMap((u) => u.ids);

    // Verify flashcards exist and belong to the user
    const { data: existingFlashcards, error: verifyError } = await this._supabaseClient
      .from("flashcards")
      .select("id")
      .in("id", allFlashcardIds)
      .eq("user_id", user_id);

    if (verifyError) {
      this._logger.error("Error verifying flashcards", { error: verifyError });
      throw new FlashcardsError("Error verifying flashcards", 500);
    }

    if (!existingFlashcards || existingFlashcards.length !== allFlashcardIds.length) {
      this._logger.error("Missing flashcards", {
        requested: allFlashcardIds,
        found: existingFlashcards?.map((f) => f.id) || [],
      });
      throw new FlashcardsError("One or more flashcards not found", 404);
    }

    // Update flashcards status in parallel for each status group
    const updatePromises = updates.map(async ({ ids, status }) => {
      this._logger.debug("Updating flashcard batch", { status, count: ids.length });

      const { data: updatedFlashcards, error: updateError } = await this._supabaseClient
        .from("flashcards")
        .update({ status })
        .in("id", ids)
        .eq("user_id", user_id)
        .select();

      if (updateError) {
        this._logger.error(`Error updating flashcards to ${status}`, { error: updateError.message });
        throw new FlashcardsError(`Error updating flashcards to ${status}: ${updateError.message}`, 500);
      }

      return updatedFlashcards?.map((card) => ({
        ...card,
        status: card.status as FlashcardActionStatus,
      }));
    });

    try {
      const results = await Promise.all(updatePromises);
      const updatedFlashcards = results.flat().filter((f): f is NonNullable<typeof f> => f !== null);

      if (updatedFlashcards.length === 0) {
        this._logger.error("No flashcards updated");
        throw new FlashcardsError("No flashcards updated", 500);
      }

      this._logger.info("Successfully updated flashcards", {
        count: updatedFlashcards.length,
        byStatus: updates.map((u) => `${u.status}: ${u.ids.length}`),
      });

      return updatedFlashcards;
    } catch (error) {
      this._logger.error("Error in batch update", { error });
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
  async createFlashcards(command: FlashcardCreateCommand, user_id: string): Promise<FlashcardDto[]> {
    this._logger.info("Creating flashcard proposals", {
      count: command.flashcards.length,
      hasGenerationIds: command.flashcards.some((f) => f.generation_id !== null),
    });

    // Verify all generation_ids exist if provided
    const generationIds = command.flashcards.map((f) => f.generation_id).filter((id): id is string => id !== null);

    if (generationIds.length > 0) {
      this._logger.debug("Verifying generation IDs", { generationIds });

      const { data: generations, error: generationsError } = await this._supabaseClient
        .from("generations")
        .select("id")
        .in("id", generationIds)
        .eq("user_id", user_id);

      if (generationsError) {
        this._logger.error("Error verifying generations", { error: generationsError });
        throw new FlashcardsError("Error verifying generations", 500);
      }

      if (!generations || generations.length !== new Set(generationIds).size) {
        this._logger.error("Missing generations", {
          requested: generationIds,
          found: generations?.map((g) => g.id) || [],
        });
        throw new FlashcardsError("One or more generation_ids not found", 404);
      }
    }

    // Create flashcards in pending state
    this._logger.debug("Creating flashcards in database");

    const { data: flashcards, error: insertError } = await this._supabaseClient
      .from("flashcards")
      .insert(
        command.flashcards.map((f) => ({
          ...f,
          user_id: user_id,
          status: "pending" as const,
        }))
      )
      .select();

    if (insertError) {
      this._logger.error("Error inserting flashcards", { error: insertError });
      throw new FlashcardsError("Error creating flashcards", 500);
    }

    if (!flashcards) {
      this._logger.error("No flashcards created");
      throw new FlashcardsError("No flashcards created", 500);
    }

    this._logger.info("Successfully created flashcard proposals", {
      count: flashcards.length,
      ids: flashcards.map((f) => f.id),
    });

    return flashcards.map((card) => ({
      ...card,
      status: card.status as FlashcardActionStatus,
    }));
  }

  /**
   * Retrieves a paginated list of flashcards with optional filtering and sorting.
   *
   * @throws {FlashcardsError} with code 401 if user is not authenticated
   * @throws {FlashcardsError} with code 500 for other errors
   */
  async getFlashcards({
    status,
    sort_by,
    page,
    page_size,
    user_id,
  }: {
    status?: FlashcardActionStatus;
    sort_by?: "created_at" | "review_count";
    page: number;
    page_size: number;
    user_id: string;
  }): Promise<FlashcardListResponseDto> {
    this._logger.info("Getting flashcards", { status, sort_by, page, page_size });

    // Build query
    let query = this._supabaseClient.from("flashcards").select("*", { count: "exact" }).eq("user_id", user_id);

    if (status) {
      query = query.eq("status", status);
    }

    if (sort_by) {
      query = query.order(sort_by, { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * page_size;
    const to = from + page_size - 1;
    query = query.range(from, to);

    // Execute query
    const { data: flashcards, error, count } = await query;

    if (error) {
      this._logger.error("Error fetching flashcards", { error });
      throw new FlashcardsError("Error fetching flashcards", 500);
    }

    if (!flashcards || count === null) {
      this._logger.error("No flashcards returned");
      throw new FlashcardsError("Error fetching flashcards", 500);
    }

    this._logger.info("Successfully fetched flashcards", {
      count: flashcards.length,
      total: count,
      page,
    });

    return {
      data: flashcards.map((card) => ({
        ...card,
        status: card.status as FlashcardActionStatus,
      })),
      pagination: {
        page,
        page_size,
        total: count,
        total_pages: Math.ceil(count / page_size),
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
  async updateFlashcard(id: string, data: Partial<FlashcardDto>, user_id: string): Promise<FlashcardDto> {
    this._logger.info("Updating flashcard", { id, data });

    // Verify flashcard exists and belongs to the user
    const { error: verifyError } = await this._supabaseClient
      .from("flashcards")
      .select("id")
      .eq("id", id)
      .eq("user_id", user_id)
      .single();

    if (verifyError) {
      this._logger.error("Error verifying flashcard", { error: verifyError });
      throw new FlashcardsError("Flashcard not found", 404);
    }

    // Update flashcard
    const { data: updatedFlashcard, error: updateError } = await this._supabaseClient
      .from("flashcards")
      .update(data)
      .eq("id", id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (updateError) {
      this._logger.error("Error updating flashcard", { error: updateError });
      throw new FlashcardsError("Error updating flashcard", 500);
    }

    if (!updatedFlashcard) {
      this._logger.error("No flashcard updated");
      throw new FlashcardsError("Error updating flashcard", 500);
    }

    this._logger.info("Successfully updated flashcard", { id: updatedFlashcard.id });

    return {
      ...updatedFlashcard,
      status: updatedFlashcard.status as FlashcardActionStatus,
    };
  }

  /**
   * Deletes a single flashcard.
   *
   * @throws {FlashcardsError} with code 404 if flashcard doesn't exist
   * @throws {FlashcardsError} with code 401 if user is not authenticated
   * @throws {FlashcardsError} with code 500 for other errors
   */
  async deleteFlashcard(id: string, user_id: string): Promise<void> {
    this._logger.info("Deleting flashcard", { id });

    // Verify flashcard exists and belongs to the user
    const { error: verifyError } = await this._supabaseClient
      .from("flashcards")
      .select("id")
      .eq("id", id)
      .eq("user_id", user_id)
      .single();

    if (verifyError) {
      this._logger.error("Error verifying flashcard", { error: verifyError });
      throw new FlashcardsError("Flashcard not found", 404);
    }

    // Delete flashcard
    const { error: deleteError } = await this._supabaseClient
      .from("flashcards")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

    if (deleteError) {
      this._logger.error("Error deleting flashcard", { error: deleteError });
      throw new FlashcardsError("Error deleting flashcard", 500);
    }

    this._logger.info("Successfully deleted flashcard", { id });
  }

  /**
   * Retrieves a list of flashcards for review.
   *
   * @throws {FlashcardsError} with code 401 if user is not authenticated
   * @throws {FlashcardsError} with code 500 for other errors
   */
  async getFlashcardsForReview(
    user_id: string,
    status: FlashcardActionStatus = "pending"
  ): Promise<FlashcardReviewDto[]> {
    this._logger.info("Getting flashcards for review", { status });

    const { data: flashcards, error: fetchError } = await this._supabaseClient
      .from("flashcards")
      .select("id, front, back, review_count, next_review_date")
      .eq("user_id", user_id)
      .eq("status", status)
      .order("next_review_date", { ascending: true, nullsFirst: true })
      .limit(10);

    if (fetchError) {
      this._logger.error("Error fetching flashcards for review", { error: fetchError });
      throw new FlashcardsError("Error fetching flashcards for review", 500);
    }

    this._logger.info("Successfully fetched flashcards for review", {
      count: flashcards?.length || 0,
    });

    return flashcards || [];
  }
}

// Export factory function instead of singleton
export const createFlashcardService = (supabase: SupabaseClient) => new FlashcardService(supabase);
