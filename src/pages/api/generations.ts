import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand } from "../../types";
import { flashcardGenerationService } from "../../lib/services/flashcardGenerationService";
import { loggingService } from "../../lib/services/loggingService";
import { createHash } from "crypto";

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

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
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      // Log validation error
      await loggingService.logGenerationError({
        userId: session.user.id,
        errorCode: "VALIDATION_FAILED",
        errorMessage: JSON.stringify(validationResult.error.errors),
        model: "validation",
        sourceTextHash: createHash("sha256")
          .update(body.source_text || "")
          .digest("hex"),
        sourceTextLength: (body.source_text || "").length,
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

    // Call the generation service
    const result = await flashcardGenerationService.generateFlashcards(command, session.user.id);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);

    // Log unexpected errors
    if (error instanceof Error) {
      await loggingService.logGenerationError({
        userId: "system", // We might not have session here
        errorCode: "UNEXPECTED_ERROR",
        errorMessage: error.message,
        model: "system",
        sourceTextHash: "error", // We might not have access to the source text
        sourceTextLength: 0,
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
