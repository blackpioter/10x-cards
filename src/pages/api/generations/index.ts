import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand } from "../../../types";
import { createGenerationService } from "../../../lib/generation.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

// Prevent prerendering of API route
export const prerender = false;

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

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

    // Create authenticated Supabase client
    const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });

    // Parse and validate request body
    const body = await request.json();
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prepare command for the service
    const command: GenerateFlashcardsCommand = {
      source_text: validationResult.data.source_text,
    };

    // Create and call the generation service with authenticated client
    const generationService = createGenerationService(supabase);
    const result = await generationService.generateFlashcards(command, authResult.user.id);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
