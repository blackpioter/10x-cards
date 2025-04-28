import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardUpdateDto } from "../../../types";
import { FlashcardsError } from "../../../lib/flashcard.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { createFlashcardService } from "../../../lib/flashcard.service";

// Validation schema for update
const flashcardUpdateSchema = z.object({
  front: z.string().max(200, "Front content must not exceed 200 characters").optional(),
  back: z.string().max(500, "Back content must not exceed 500 characters").optional(),
  source: z
    .enum(["manual", "ai-full", "ai-edited"], {
      errorMap: () => ({ message: "Invalid source value" }),
    })
    .optional(),
  generation_id: z.string().uuid("Invalid generation ID format").nullable().optional(),
  status: z
    .enum(["pending", "accepted", "rejected"], {
      errorMap: () => ({ message: "Status must be either 'pending', 'accepted', or 'rejected'" }),
    })
    .optional(),
});

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params, locals, cookies }) => {
  try {
    // Check authentication
    const authResult = await locals.auth();
    if (!authResult) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate ID parameter
    const { id } = params;
    if (!id || !z.string().uuid().safeParse(id).success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = flashcardUpdateSchema.safeParse(body);

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

    const updateData = validationResult.data as FlashcardUpdateDto;

    // Create Supabase client with auth context
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Create flashcard service with authenticated client
    const flashcardService = createFlashcardService(supabase);

    // Update flashcard using the service
    const flashcard = await flashcardService.updateFlashcard(id, updateData, authResult.user.id);

    return new Response(
      JSON.stringify({
        data: flashcard,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating flashcard:", error);

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

export const DELETE: APIRoute = async ({ params, locals, cookies, request }) => {
  try {
    // Check authentication
    const authResult = await locals.auth();
    if (!authResult) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate ID parameter
    const { id } = params;
    if (!id || !z.string().uuid().safeParse(id).success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with auth context
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Create flashcard service with authenticated client
    const flashcardService = createFlashcardService(supabase);

    // Delete flashcard using the service
    await flashcardService.deleteFlashcard(id, authResult.user.id);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);

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
