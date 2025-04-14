import { createClient, type SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Export typed SupabaseClient
export type SupabaseClient = BaseSupabaseClient<Database>;

// Default development user ID from environment variables
export const DEFAULT_USER_ID = import.meta.env.DEFAULT_USER_ID;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
