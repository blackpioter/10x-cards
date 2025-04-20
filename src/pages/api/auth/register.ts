import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log("Registration request received");

    // Check Content-Type
    const contentType = request.headers.get("content-type");
    console.log("Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      console.log("Invalid Content-Type");
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
      console.log("Request body parsed:", { email: body.email }); // Log without password
    } catch (e) {
      console.error("JSON Parse Error:", e);
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
      console.log("Missing required fields");
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    console.log("Calling Supabase signUp");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Supabase Auth Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.log("Supabase signUp successful");

    // Check if user needs to confirm their email
    if (data?.user?.identities?.length === 0) {
      console.log("Email confirmation required");
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

    console.log("Registration successful, no email confirmation required");
    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
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
