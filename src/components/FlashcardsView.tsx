import { useState, useEffect } from "react";
import type { FlashcardListResponseDto, FlashcardViewModel, PaginationDto, FlashcardStatsViewModel } from "../types";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";
import FlashcardStats from "./FlashcardStats";
import FlashcardFilters from "./FlashcardFilters";
import { ExistingFlashcardList } from "./ExistingFlashcardList";
import PaginationControls from "./PaginationControls";

export type FlashcardStatus = "pending" | "accepted" | "rejected" | "all";

interface EditModalState {
  isOpen: boolean;
  flashcard: FlashcardViewModel | null;
}

interface DeleteModalState {
  isOpen: boolean;
  flashcardId: string | null;
}

export default function FlashcardsView() {
  // State management
  const [flashcards, setFlashcards] = useState<FlashcardViewModel[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<FlashcardStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FlashcardStatsViewModel>({
    currentListTotal: 0,
    pendingReviewCount: 0,
  });
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    flashcard: null,
  });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    flashcardId: null,
  });

  // Fetch flashcards data
  const fetchFlashcards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        page_size: pagination.page_size.toString(),
      });

      if (statusFilter !== "all") {
        queryParams.append("status", statusFilter);
      }

      const response = await fetch(`/api/flashcards?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to load flashcards");
      }

      const data: FlashcardListResponseDto = await response.json();
      setFlashcards(data.data as FlashcardViewModel[]);
      setPagination(data.pagination);
      setStats((prev: FlashcardStatsViewModel) => ({ ...prev, currentListTotal: data.pagination.total }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending count for stats
  const fetchPendingCount = async () => {
    try {
      const response = await fetch("/api/flashcards?status=pending&page_size=1");
      if (!response.ok) {
        throw new Error("Failed to load pending count");
      }

      const data: FlashcardListResponseDto = await response.json();
      setStats((prev: FlashcardStatsViewModel) => ({ ...prev, pendingReviewCount: data.pagination.total }));
    } catch (err) {
      console.error("Failed to fetch pending count:", err);
      // Don't set error state as this is not critical for the main functionality
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFlashcards();
    fetchPendingCount();
  }, []);

  // Fetch data when filters or pagination changes
  useEffect(() => {
    fetchFlashcards();
  }, [statusFilter, pagination.page]);

  const handleFilterChange = (newFilter: FlashcardStatus) => {
    setStatusFilter(newFilter);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleEdit = (flashcard: FlashcardViewModel) => {
    setEditModal({ isOpen: true, flashcard });
  };

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, flashcardId: id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <FlashcardStats currentListTotal={stats.currentListTotal} pendingReviewCount={stats.pendingReviewCount} />
      <FlashcardFilters currentFilter={statusFilter} onFilterChange={handleFilterChange} />
      <ExistingFlashcardList flashcards={flashcards} onEdit={handleEdit} onDelete={handleDelete} />
      <div className="flex justify-center">
        <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
      </div>
      {/* Modals will be added in subsequent steps */}
    </div>
  );
}
