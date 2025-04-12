import type { MiddlewareHandler } from "astro";
import { supabaseClient, DEFAULT_USER_ID } from "../db/supabase.client";

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.supabase = supabaseClient;

  // Use default user ID for development
  context.locals.auth = async () => ({
    user: {
      id: DEFAULT_USER_ID,
      aud: "authenticated",
      role: "authenticated",
      email: "dev@example.com",
      created_at: new Date().toISOString(),
      app_metadata: { provider: "email" },
      user_metadata: {},
      identities: [],
    },
  });

  return next();
};
