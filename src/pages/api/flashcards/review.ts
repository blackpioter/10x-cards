import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardsError } from "../../../lib/flashcard.service";
import { supabaseClient } from "../../../db/supabase.client";
import type { FlashcardReviewDto } from "../../../types";

// Validation schema for query parameters
const reviewQuerySchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]).optional().default("pending"),
});

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
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

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "User not authenticated",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get flashcards for review
    const { data: flashcards, error: fetchError } = await supabaseClient
      .from("flashcards")
      .select("id, front, back, review_count, next_review_date")
      .eq("user_id", user.id)
      .eq("status", status)
      .order("next_review_date", { ascending: true, nullsFirst: true })
      .limit(10);

    if (fetchError) {
      console.error("Error fetching flashcards for review:", fetchError);
      throw new FlashcardsError("Error fetching flashcards for review", 500);
    }

    const reviewCards: FlashcardReviewDto[] = flashcards || [];

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
