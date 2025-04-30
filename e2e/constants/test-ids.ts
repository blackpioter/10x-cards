import { TEST_IDS as GENERATE_VIEW_TEST_IDS } from "../../src/components/generate/GenerateView/constants";
import { TEST_IDS as FLASHCARD_LIST_TEST_IDS } from "../../src/components/FlashcardList/constants";
import { TEST_IDS as FLASHCARD_LIST_ITEM_TEST_IDS } from "../../src/components/FlashcardListItem/constants";
import { TEST_IDS as ERROR_NOTIFICATION_TEST_IDS } from "../../src/components/common/ErrorNotification/constants";

export const E2E_TEST_IDS = {
  GENERATE_VIEW: {
    ...GENERATE_VIEW_TEST_IDS,
  },
  FLASHCARD_LIST: {
    ...FLASHCARD_LIST_TEST_IDS,
  },
  FLASHCARD_ITEM: {
    ...FLASHCARD_LIST_ITEM_TEST_IDS,
  },
  ERROR: {
    ...ERROR_NOTIFICATION_TEST_IDS,
  },
} as const;

// Common test ID getters for E2E tests
export const getGenerateViewTestId = (id: keyof typeof GENERATE_VIEW_TEST_IDS) => GENERATE_VIEW_TEST_IDS[id];

export const getFlashcardListTestId = (id: keyof typeof FLASHCARD_LIST_TEST_IDS) => FLASHCARD_LIST_TEST_IDS[id];

export const getFlashcardItemTestId = (id: keyof typeof FLASHCARD_LIST_ITEM_TEST_IDS) =>
  FLASHCARD_LIST_ITEM_TEST_IDS[id];

export const getErrorNotificationTestId = (id: keyof typeof ERROR_NOTIFICATION_TEST_IDS) =>
  ERROR_NOTIFICATION_TEST_IDS[id];
