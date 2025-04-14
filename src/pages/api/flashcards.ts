import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardCreateCommand, FlashcardDto } from "../../types";
import { FlashcardsError, createFlashcards } from "../../lib/flashcard.service";

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

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
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

    // Create flashcards using the service
    const flashcards = await createFlashcards(command);

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
    console.error("Error creating flashcards:", error);

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
