import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("delete test data from database", async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;
  const testUserEmail = process.env.E2E_USERNAME;
  const testUserPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseKey || !testUserId || !testUserEmail || !testUserPassword) {
    throw new Error(
      "Required environment variables are not set: SUPABASE_URL, SUPABASE_KEY, E2E_USERNAME_ID, E2E_USERNAME, or E2E_PASSWORD"
    );
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  console.log("Authenticating as test user...");

  try {
    // First authenticate as the test user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    });

    if (signInError) {
      console.error("Error signing in:", signInError.message);
      throw signInError;
    }

    console.log("Successfully authenticated. Cleaning up test data...");

    // Delete flashcards for test user and return the count of deleted records
    const { error: deleteFlashcardsError, data: deletedFlashcards } = await supabase
      .from("flashcards")
      .delete()
      .eq("user_id", testUserId)
      .select();

    if (deleteFlashcardsError) {
      console.error("Error deleting test flashcards:", deleteFlashcardsError.message);
      throw deleteFlashcardsError;
    }

    const flashcardsCount = deletedFlashcards?.length ?? 0;
    console.log(`Successfully cleaned up flashcards. Deleted ${flashcardsCount} records.`);

    // Delete generations for test user and return the count of deleted records
    const { error: deleteGenerationsError, data: deletedGenerations } = await supabase
      .from("generations")
      .delete()
      .eq("user_id", testUserId)
      .select();

    if (deleteGenerationsError) {
      console.error("Error deleting test generations:", deleteGenerationsError.message);
      throw deleteGenerationsError;
    }

    const generationsCount = deletedGenerations?.length ?? 0;
    console.log(`Successfully cleaned up generations. Deleted ${generationsCount} records.`);

    // Delete error logs for test user and return the count of deleted records
    const { error: deleteErrorLogsError, data: deletedErrorLogs } = await supabase
      .from("generation_error_logs")
      .delete()
      .eq("user_id", testUserId)
      .select();

    if (deleteErrorLogsError) {
      console.error("Error deleting test error logs:", deleteErrorLogsError.message);
      throw deleteErrorLogsError;
    }

    const errorLogsCount = deletedErrorLogs?.length ?? 0;
    console.log(`Successfully cleaned up error logs. Deleted ${errorLogsCount} records.`);

    console.log(`Total records deleted: ${flashcardsCount + generationsCount + errorLogsCount}`);
  } catch (error) {
    console.error("Failed to clean up test data:", error);
    throw error;
  }
});
