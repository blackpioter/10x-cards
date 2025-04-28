import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("delete test data from database", async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseKey || !testUserId) {
    throw new Error("Required environment variables are not set: SUPABASE_URL, SUPABASE_KEY, or E2E_USERNAME_ID");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  console.log("Cleaning up test data...");

  try {
    // Delete flashcards for test user
    const { error: deleteError } = await supabase.from("flashcards").delete().eq("user_id", testUserId);

    if (deleteError) {
      console.error("Error deleting test flashcards:", deleteError.message);
      throw deleteError;
    }

    console.log("Successfully cleaned up test data");
  } catch (error) {
    console.error("Failed to clean up test data:", error);
    throw error;
  }
});
