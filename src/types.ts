// src/types.ts
/**
 * DTO and Command Model definitions for the 10x Cards application.
 *
 * These types are built upon the database models from 'src/db/database.types.ts'
 * and are aligned with the API plan specified in '.ai/api-plan.md' as well as the
 * database plan from '.ai/db-plan.md'.
 *
 * They include Data Transfer Objects (DTOs) for flashcards, generations, and generation error logs,
 * as well as command models used for creating and updating flashcards and generations.
 */

import type { Database } from "./db/database.types";

// Extract base entity types from the database models
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type GenerationErrorLog = Database["public"]["Tables"]["generation_error_logs"]["Row"];

/* ============================================================
   Flashcard Types
   ============================================================ */

export type FlashcardStatus = "pending" | "accepted" | "rejected" | "all";
export type FlashcardActionStatus = Exclude<FlashcardStatus, "all">;

/**
 * DTO representing a flashcard as returned by the API.
 *
 * This directly corresponds to the flashcards table row.
 */
export type FlashcardDto = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
> & {
  status: FlashcardActionStatus;
};

// Flashcard List Response DTO based on the API plan
export interface FlashcardListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

export type FlashcardSource = "manual" | "ai-full" | "ai-edited";

export interface FlashcardCreateDto {
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id: string | null;
}

export interface FlashcardCreateCommand {
  flashcards: FlashcardCreateDto[];
}

export type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id: string | null;
  status: "pending" | "accepted" | "rejected";
}>;

/* ============================================================
   Generation Types
   ============================================================ */

/**
 * Command model for generating flashcard proposals.
 *
 * The API expects a source_text between 1000 and 10000 characters.
 */
export interface GenerateFlashcardsCommand {
  source_text: string;
}

export interface FlashcardProposalDto {
  id: string;
  front: string;
  back: string;
  source: "ai-full" | "ai-edited";
}

export interface GenerationCreateResponseDto {
  generation_id: string;
  flashcard_proposals: FlashcardProposalDto[];
  generated_count: number;
}

export type GenerationDetailDto = Generation & {
  flashcards?: FlashcardDto[];
};

/* ============================================================
   Generation Error Log Types
   ============================================================ */

/**
 * DTO representing an error log entry for flashcard generation errors.
 *
 * This type corresponds directly to the generation_error_logs table row.
 */
export type GenerationErrorLogDto = Pick<
  GenerationErrorLog,
  "id" | "error_code" | "error_message" | "model" | "source_text_hash" | "source_text_length" | "created_at" | "user_id"
>;

/* ============================================================
   Utility Types
   ============================================================ */

/**
 * Generic Pagination DTO.
 * Provides pagination information for a list of items.
 */
export interface PaginationDto {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/* ============================================================
   View State Types
   ============================================================ */

export interface FlashcardProposalViewModel {
  id: string;
  front: string;
  back: string;
  status: "pending" | "accepted" | "rejected";
  isEdited: boolean;
  originalContent?: {
    front: string;
    back: string;
  };
}

export interface FlashcardProposalListViewModel {
  proposals: FlashcardProposalViewModel[];
  stats: {
    total: number;
    accepted: number;
    rejected: number;
    edited: number;
  };
}

export interface GenerateViewState {
  stage: "input" | "generating" | "review";
  error?: string;
  generationId?: string;
  proposals?: FlashcardProposalListViewModel;
}

export interface ErrorState {
  type: "validation" | "api" | "network" | "generation";
  message: string;
  code?: string;
  action?: {
    label: string;
    handler: () => void;
  };
  timestamp?: number;
}

/**
 * DTO for flashcards in review mode.
 * Contains only the essential fields needed for review.
 */
export interface FlashcardReviewDto {
  id: string;
  front: string;
  back: string;
  review_count: number;
  next_review_date: string | null;
}

/**
 * View Model representing a flashcard in the list view.
 * Extends FlashcardDto with UI-specific fields.
 */
export interface FlashcardViewModel extends FlashcardDto {
  operations: {
    statusChange: {
      isLoading: boolean;
      error: string | null;
    };
    delete: {
      isLoading: boolean;
      error: string | null;
    };
    edit: {
      isLoading: boolean;
      error: string | null;
    };
  };
}

/**
 * View Model for displaying flashcard statistics.
 */
export interface FlashcardStatsViewModel {
  currentListTotal: number;
  pendingReviewCount: number;
}
