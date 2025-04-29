import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand } from "../../../types";
import { createGenerationService } from "../../../lib/generation.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { createLogger } from "@/lib/logger";

const apiLogger = createLogger("api:generations");

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
      apiLogger.warn("Unauthorized generation request");
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
      apiLogger.warn("Validation failed for generation request", {
        errors: validationResult.error.errors,
        userId: authResult.user.id,
      });
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

    apiLogger.info("Successfully generated flashcards", {
      userId: authResult.user.id,
      result,
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    apiLogger.error("Error processing generation request", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
