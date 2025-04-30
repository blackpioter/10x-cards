export const TEST_IDS = {
  CONTAINER: "flashcard-list",
  ITEM: "flashcard-item",
  CONTENT: {
    FRONT: "front-content",
    BACK: "back-content",
  },
  ACTIONS: {
    ACCEPT: "accept-flashcard",
    REJECT: "reject-flashcard",
    EDIT: "edit-flashcard",
    SAVE_EDIT: "save-edit",
    CANCEL_EDIT: "cancel-edit",
    RESTORE: "restore-flashcard",
    ACCEPT_ALL: "accept-all",
  },
  STATS: {
    CONTAINER: "flashcard-stats",
    EDITED: "stat-edited",
    ACCEPTED: "stat-accepted",
    REJECTED: "stat-rejected",
  },
  FILTERS: {
    CONTAINER: "flashcard-filters",
    ALL: {
      BUTTON: "filter-all",
      COUNT: "filter-all-count",
    },
    ACCEPTED: {
      BUTTON: "filter-accepted",
      COUNT: "filter-accepted-count",
    },
    REJECTED: {
      BUTTON: "filter-rejected",
      COUNT: "filter-rejected-count",
    },
  },
} as const;
