import type { MiddlewareHandler } from "astro";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  // Pages
  "/login",
  "/register",
  "/forgot-password",
  // API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/logout",
];

// Protected paths that require authentication
const PROTECTED_PATHS = [
  "/logout", // Logout page should only be accessible to logged-in users
  "/generate",
  "/flashcards",
];

export const onRequest: MiddlewareHandler = async ({ cookies, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Get the current path
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(path)) {
    return next();
  }

  // Get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // For protected paths, ensure user is logged in
  if (!user && (PROTECTED_PATHS.includes(path) || !PUBLIC_PATHS.includes(path))) {
    return redirect("/login");
  }

  return next();
};
