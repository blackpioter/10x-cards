import { useState, useCallback, useEffect } from "react";
import type {
  FlashcardViewModel,
  FlashcardDto,
  FlashcardStatus,
  FlashcardActionStatus,
  PaginationDto,
  FlashcardStatsViewModel,
} from "../../../types";
import { logger } from "@/lib/logger";

interface UseFlashcardsOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialStatus?: FlashcardStatus;
}

interface UseFlashcardsState {
  flashcards: FlashcardViewModel[];
  pagination: PaginationDto;
  stats: FlashcardStatsViewModel;
  statusCounts: {
    all: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useFlashcards({
  initialPage = 1,
  initialPageSize = 20,
  initialStatus = "all",
}: UseFlashcardsOptions = {}) {
  const [state, setState] = useState<UseFlashcardsState>({
    flashcards: [],
    pagination: {
      total: 0,
      page: initialPage,
      page_size: initialPageSize,
      total_pages: 0,
    },
    stats: {
      currentListTotal: 0,
      pendingReviewCount: 0,
    },
    statusCounts: {
      all: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
    },
    isLoading: true,
    error: null,
  });

  const [statusFilter, setStatusFilter] = useState<FlashcardStatus>(initialStatus);

  // Function to transform FlashcardDto to FlashcardViewModel
  const toViewModel = useCallback((dto: FlashcardDto): FlashcardViewModel => {
    return {
      ...dto,
      operations: {
        statusChange: { isLoading: false, error: null },
        delete: { isLoading: false, error: null },
        edit: { isLoading: false, error: null },
      },
    };
  }, []);

  // Function to fetch flashcards from the API
  const fetchFlashcards = useCallback(
    async (page: number, status: FlashcardStatus = "all") => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const params = new URLSearchParams({
          page: page.toString(),
          page_size: state.pagination.page_size.toString(),
          ...(status !== "all" && { status }),
        });

        const response = await fetch(`/api/flashcards?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch flashcards");
        }

        const data = await response.json();
        setState((prev) => ({
          ...prev,
          flashcards: data.data.map(toViewModel),
          pagination: data.pagination,
          stats: {
            ...prev.stats,
            currentListTotal: data.pagination.total,
          },
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        }));
      }
    },
    [state.pagination.page_size, toViewModel]
  );

  // Function to fetch pending review count
  const fetchPendingCount = useCallback(async () => {
    try {
      const response = await fetch("/api/flashcards?status=pending&page_size=1");
      if (!response.ok) {
        throw new Error("Failed to fetch pending count");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          pendingReviewCount: data.pagination.total,
        },
      }));
    } catch (error) {
      logger.error("Error fetching pending count:", error);
    }
  }, []);

  // Function to fetch counts for each status
  const fetchStatusCounts = useCallback(async () => {
    try {
      // Get total count
      const totalResponse = await fetch("/api/flashcards?page=1&page_size=10");
      if (!totalResponse.ok) {
        logger.error("Total count response not OK:", await totalResponse.text());
        throw new Error("Failed to fetch total count");
      }
      const totalData = await totalResponse.json();
      const total = totalData.pagination.total;

      // Get counts for specific statuses
      const statuses: FlashcardActionStatus[] = ["pending", "accepted", "rejected"];
      const statusCounts = await Promise.all(
        statuses.map(async (status) => {
          const response = await fetch(`/api/flashcards?status=${status}&page=1&page_size=10`);
          if (!response.ok) {
            logger.error(`Count response for ${status} not OK:`, await response.text());
            throw new Error(`Failed to fetch count for ${status} status`);
          }

          const data = await response.json();
          return { status, count: data.pagination.total };
        })
      );

      const newStatusCounts = {
        all: total,
        pending: 0,
        accepted: 0,
        rejected: 0,
        ...statusCounts.reduce(
          (acc, { status, count }) => ({
            ...acc,
            [status]: count,
          }),
          {}
        ),
      };

      setState((prev) => ({
        ...prev,
        statusCounts: newStatusCounts,
      }));
    } catch (error) {
      logger.error("Error fetching status counts:", error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchFlashcards(initialPage, initialStatus);
    fetchPendingCount();
    fetchStatusCounts();
  }, [fetchFlashcards, fetchPendingCount, fetchStatusCounts, initialPage, initialStatus]);

  // Function to update flashcard status
  const updateFlashcardStatus = useCallback(
    async (id: string, newStatus: FlashcardActionStatus) => {
      // Optimistically update the UI
      setState((prev) => {
        const flashcard = prev.flashcards.find((f) => f.id === id);
        if (!flashcard) return prev;

        const shouldRemoveFromList = statusFilter !== "all" && newStatus !== statusFilter;
        const updatedFlashcards = prev.flashcards
          .map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: newStatus,
                  operations: { ...f.operations, statusChange: { isLoading: true, error: null } },
                }
              : f
          )
          .filter((f) => !(f.id === id && shouldRemoveFromList));

        // Update status counts optimistically
        const statusCounts = { ...prev.statusCounts };
        if (flashcard.status !== newStatus) {
          statusCounts[flashcard.status as FlashcardActionStatus]--;
          statusCounts[newStatus]++;
        }

        return {
          ...prev,
          flashcards: updatedFlashcards,
          statusCounts,
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total - (shouldRemoveFromList ? 1 : 0),
          },
        };
      });

      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error("Failed to update flashcard status");
        }

        // Update loading state after successful update
        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.map((f) =>
            f.id === id
              ? {
                  ...f,
                  operations: { ...f.operations, statusChange: { isLoading: false, error: null } },
                }
              : f
          ),
        }));

        // Update counts in the background
        fetchStatusCounts();
      } catch (error) {
        // Revert optimistic update on error
        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.map((f) =>
            f.id === id
              ? {
                  ...f,
                  operations: {
                    ...f.operations,
                    statusChange: {
                      isLoading: false,
                      error: error instanceof Error ? error.message : "Failed to update status",
                    },
                  },
                }
              : f
          ),
        }));
        // Refresh counts to ensure they're accurate
        fetchStatusCounts();
      }
    },
    [statusFilter, fetchStatusCounts]
  );

  // Function to delete flashcard
  const deleteFlashcard = useCallback(
    async (id: string) => {
      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.map((f) =>
          f.id === id ? { ...f, operations: { ...f.operations, delete: { isLoading: true, error: null } } } : f
        ),
      }));

      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete flashcard");
        }

        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.filter((f) => f.id !== id),
          stats: {
            ...prev.stats,
            currentListTotal: prev.stats.currentListTotal - 1,
          },
        }));

        // Refresh all counts after deletion
        fetchStatusCounts();
        fetchPendingCount();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.map((f) =>
            f.id === id
              ? {
                  ...f,
                  operations: {
                    ...f.operations,
                    delete: {
                      isLoading: false,
                      error: error instanceof Error ? error.message : "Failed to delete flashcard",
                    },
                  },
                }
              : f
          ),
        }));
      }
    },
    [fetchStatusCounts, fetchPendingCount]
  );

  // Function to update flashcard content
  const updateFlashcard = useCallback(
    async (id: string, front: string, back: string) => {
      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.map((f) =>
          f.id === id ? { ...f, operations: { ...f.operations, edit: { isLoading: true, error: null } } } : f
        ),
      }));

      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back }),
        });

        if (!response.ok) {
          throw new Error("Failed to update flashcard");
        }

        const updatedFlashcard = await response.json();
        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.map((f) =>
            f.id === id
              ? {
                  ...toViewModel(updatedFlashcard.data),
                  operations: { ...f.operations, edit: { isLoading: false, error: null } },
                }
              : f
          ),
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          flashcards: prev.flashcards.map((f) =>
            f.id === id
              ? {
                  ...f,
                  operations: {
                    ...f.operations,
                    edit: {
                      isLoading: false,
                      error: error instanceof Error ? error.message : "Failed to update flashcard",
                    },
                  },
                }
              : f
          ),
        }));
      }
    },
    [toViewModel]
  );

  // Function to change page
  const goToPage = useCallback(
    (page: number) => {
      fetchFlashcards(page, statusFilter);
    },
    [fetchFlashcards, statusFilter]
  );

  // Function to change status filter
  const filterByStatus = useCallback(
    (status: FlashcardStatus) => {
      setStatusFilter(status);
      fetchFlashcards(1, status);
    },
    [fetchFlashcards]
  );

  return {
    ...state,
    statusFilter,
    statusCounts: state.statusCounts,
    updateFlashcardStatus,
    deleteFlashcard,
    updateFlashcard,
    goToPage,
    filterByStatus,
  };
}
