import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { createLogger } from "@/lib/logger";

const authLogger = createLogger("auth:register");

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    authLogger.info("Registration request received");

    // Check Content-Type
    const contentType = request.headers.get("content-type");
    authLogger.debug("Request details", { contentType });

    if (!contentType || !contentType.includes("application/json")) {
      authLogger.warn("Invalid Content-Type received", { contentType });
      return new Response(
        JSON.stringify({
          error: "Content-Type must be application/json",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let body;
    try {
      body = await request.json();
      authLogger.debug("Request body parsed", { email: body.email }); // Log without password
    } catch (e) {
      authLogger.error("JSON parse error", { error: e });
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      authLogger.warn("Missing required fields", { email: !!email, password: !!password });
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    authLogger.debug("Calling Supabase signUp");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      authLogger.error("Supabase auth error", { error: error.message });
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    authLogger.info("Supabase signUp successful");

    // Check if user needs to confirm their email
    if (data?.user?.identities?.length === 0) {
      authLogger.info("Email confirmation required", { email });
      return new Response(
        JSON.stringify({
          message: "Please check your email for confirmation link",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    authLogger.info("Registration successful, no email confirmation required", { email });
    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    authLogger.error("Registration error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
