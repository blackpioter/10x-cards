import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardUpdateDto } from "../../../types";
import { FlashcardsError, flashcardService } from "../../../lib/flashcard.service";

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
});

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  try {
    // Check authentication
    const session = await locals.auth();
    if (!session) {
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

    // Update flashcard using the service
    const flashcard = await flashcardService.updateFlashcard(id, updateData, session.user.id);

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

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check authentication
    const session = await locals.auth();
    if (!session) {
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

    // Delete flashcard using the service
    await flashcardService.deleteFlashcard(id, session.user.id);

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
