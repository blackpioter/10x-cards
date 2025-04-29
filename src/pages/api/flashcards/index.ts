import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardCreateCommand } from "../../../types";
import { FlashcardsError } from "../../../lib/flashcard.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { createFlashcardService } from "../../../lib/flashcard.service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("flashcards-api");

// Validation schemas
const flashcardCreateSchema = z.object({
  front: z.string().max(200, "Front content must not exceed 200 characters"),
  back: z.string().max(500, "Back content must not exceed 500 characters"),
  source: z.enum(["manual", "ai-full", "ai-edited"], {
    errorMap: () => ({ message: "Invalid source value" }),
  }),
  generation_id: z.string().uuid("Invalid generation ID format").nullable(),
});

const flashcardsCreateCommandSchema = z.object({
  flashcards: z.array(flashcardCreateSchema).min(1).max(100),
});

// Validation schemas for GET request query parameters
const flashcardFilterSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
  sort_by: z.enum(["created_at", "review_count"]).optional(),
  page: z.coerce.number().int().positive("Page must be a positive integer"),
  page_size: z.coerce.number().int().min(10, "Page size must be at least 10").max(100, "Page size must not exceed 100"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // Check authentication
    const authResult = await locals.auth();
    if (!authResult) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = flashcardsCreateCommandSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command = validationResult.data as FlashcardCreateCommand;

    // Create Supabase client with auth context
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Create flashcard service with authenticated client
    const flashcardService = createFlashcardService(supabase);

    // Create flashcards using the service
    const flashcards = await flashcardService.createFlashcards(command, authResult.user.id);

    return new Response(
      JSON.stringify({
        data: flashcards,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error("Error creating flashcards:", error);

    if (error instanceof FlashcardsError) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: error.code,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // Check authentication
    const authResult = await locals.auth();
    if (!authResult) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse URL parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    // Validate query parameters
    const validationResult = flashcardFilterSchema.safeParse(params);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { status, sort_by, page, page_size } = validationResult.data;

    // Create Supabase client with auth context
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Create flashcard service with authenticated client
    const flashcardService = createFlashcardService(supabase);

    // Get flashcards using the service
    const result = await flashcardService.getFlashcards({
      status,
      sort_by,
      page,
      page_size,
      user_id: authResult.user.id,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error fetching flashcards:", error);

    if (error instanceof FlashcardsError) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: error.code,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
