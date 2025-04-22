import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardsError, flashcardService } from "../../../lib/flashcard.service";

// Validation schema
const updateStatusSchema = z.object({
  status: z.enum(["accepted", "rejected", "pending"], {
    errorMap: () => ({ message: "Status must be either 'accepted', 'rejected', or 'pending'" }),
  }),
  flashcard_ids: z.array(z.string().uuid("Invalid flashcard ID format")).min(1),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check authentication
    const session = await locals.auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);

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

    const { status, flashcard_ids } = validationResult.data;

    // Update flashcards status using the service
    const flashcards = await flashcardService.updateFlashcardsStatus(
      [
        {
          ids: flashcard_ids,
          status,
        },
      ],
      session.user.id
    );

    return new Response(
      JSON.stringify({
        data: flashcards,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating flashcards status:", error);

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
