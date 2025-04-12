import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Default development user ID
export const DEFAULT_USER_ID = "3ceff7bd-9676-43f4-bd40-02c0c6c2a62e";

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get the current user ID (using default for development)
export const getCurrentUserId = () => DEFAULT_USER_ID;
