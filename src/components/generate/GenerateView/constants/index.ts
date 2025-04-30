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
  TEXT_INPUT: {
    FORM: "text-input-form",
    TEXTAREA: "text-input-textarea",
    CHARACTER_COUNT: "text-input-character-count",
    CHARACTERS_NEEDED: "text-input-characters-needed",
    SUBMIT: "text-input-submit",
  },
  GENERATION_PROGRESS: {
    CONTAINER: "generation-progress",
    SPINNER: "generation-progress-spinner",
    STATUS: "generation-progress-status",
    CANCEL: "generation-progress-cancel",
  },
  REVIEW_SECTION: {
    CONTAINER: "flashcard-review-section",
    LIST: "flashcard-review-section-list",
    STATS: {
      CONTAINER: "review-section-stats",
      EDITED: "review-section-stat-edited",
      ACCEPTED: "review-section-stat-accepted",
      REJECTED: "review-section-stat-rejected",
    },
    FILTERS: {
      ALL: "review-section-filter-all",
      ACCEPTED: "review-section-filter-accepted",
      REJECTED: "review-section-filter-rejected",
    },
    ACTIONS: {
      ACCEPT_ALL: "review-section-accept-all",
    },
  },
  COMPLETION_MODAL: {
    CONTAINER: "completion-modal",
    GENERATE_NEW: "completion-modal-generate-new",
    VIEW_ALL: "completion-modal-view-all",
  },
} as const;
