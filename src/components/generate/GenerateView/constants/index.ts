// View States
export const STATES = {
  INPUT: "input",
  GENERATING: "generating",
  REVIEW: "review",
  COMPLETED: "completed",
} as const;

// Generation Settings
export const GENERATION_CONFIG = {
  MIN_TEXT_LENGTH: 1000,
  MAX_TEXT_LENGTH: 10000,
  MIN_FLASHCARDS: 5,
  MAX_FLASHCARDS: 50,
  SAVE_DELAY: 2000, // ms
  BATCH_SIZE: 5,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  GENERATIONS: "/api/generations",
  FLASHCARDS: "/api/flashcards",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERATION_FAILED: "Failed to generate flashcards",
  INVALID_TEXT_LENGTH: "Text must be between 1000 and 10000 characters",
  NO_PROPOSALS: "No proposals available",
  NETWORK_ERROR: "Network error occurred",
} as const;

// Status Messages
export const STATUS_MESSAGES = {
  INITIALIZING: "Initializing generation...",
  GENERATING: "Generating flashcards...",
  FINISHING: "Finishing up...",
} as const;

// Test IDs
export const TEST_IDS = {
  GENERATE_VIEW: "generate-view",
  TEXT_INPUT: "text-input-section",
  GENERATION_PROGRESS: "generation-progress",
  REVIEW_SECTION: "flashcard-review-section",
  ERROR_NOTIFICATION: "error-notification",
} as const;
