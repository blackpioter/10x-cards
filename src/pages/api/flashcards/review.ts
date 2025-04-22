import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardsError, flashcardService } from "../../../lib/flashcard.service";

// Validation schema for query parameters
const reviewQuerySchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]).optional().default("pending"),
});

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
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
    const validationResult = reviewQuerySchema.safeParse(params);

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

    const { status } = validationResult.data;

    // Get flashcards for review using the service
    const reviewCards = await flashcardService.getFlashcardsForReview(authResult.user.id, status);

    return new Response(
      JSON.stringify({
        data: reviewCards,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in review endpoint:", error);

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
