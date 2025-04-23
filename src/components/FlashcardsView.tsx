import { useState, useEffect } from "react";
import type {
  FlashcardListResponseDto,
  FlashcardViewModel,
  PaginationDto,
  FlashcardStatsViewModel,
  FlashcardStatus,
  FlashcardActionStatus,
} from "../types";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";
import FlashcardStats from "./FlashcardStats";
import FlashcardFilters from "./FlashcardFilters";
import { ExistingFlashcardList } from "./ExistingFlashcardList";
import PaginationControls from "./PaginationControls";
import { EditFlashcardModal } from "./EditFlashcardModal";
import { DeleteFlashcardDialog } from "./DeleteFlashcardDialog";
import { toast } from "sonner";

interface FlashcardOperationState {
  isLoading: boolean;
  error: string | null;
}

interface FlashcardViewModelExtended extends FlashcardViewModel {
  operations: {
    statusChange: FlashcardOperationState;
    delete: FlashcardOperationState;
    edit: FlashcardOperationState;
  };
}

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
  const [flashcards, setFlashcards] = useState<FlashcardViewModelExtended[]>([]);
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
      setFlashcards(
        data.data.map((flashcard) => ({
          ...flashcard,
          status: flashcard.status as FlashcardActionStatus,
          operations: {
            statusChange: { isLoading: false, error: null },
            delete: { isLoading: false, error: null },
            edit: { isLoading: false, error: null },
          },
        }))
      );
      setPagination(data.pagination);
      setStats((prev) => ({ ...prev, currentListTotal: data.pagination.total }));
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

  const setFlashcardOperation = (
    id: string,
    operation: keyof FlashcardViewModelExtended["operations"],
    state: Partial<FlashcardOperationState>
  ) => {
    setFlashcards((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              operations: {
                ...f.operations,
                [operation]: { ...f.operations[operation], ...state },
              },
            }
          : f
      )
    );
  };

  const handleStatusChange = async (id: string, newStatus: FlashcardActionStatus) => {
    try {
      const flashcard = flashcards.find((f) => f.id === id);
      if (!flashcard) return;

      setFlashcardOperation(id, "statusChange", { isLoading: true, error: null });

      const oldStatus = flashcard.status as FlashcardActionStatus;

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update flashcard status`);
      }

      const updatedFlashcard: FlashcardViewModel = await response.json();

      // Update flashcards list
      setFlashcards((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: updatedFlashcard.status,
                operations: {
                  ...f.operations,
                  statusChange: { isLoading: false, error: null },
                },
              }
            : f
        )
      );

      // If we're filtering by status, we might need to remove the card from the list
      if (statusFilter !== "all" && statusFilter !== newStatus) {
        setFlashcards((prev) => prev.filter((f) => f.id !== id));
        setStats((prev) => ({
          ...prev,
          currentListTotal: prev.currentListTotal - 1,
        }));
      }

      // Update pending count if we're changing from/to pending status
      if (oldStatus === "pending" && newStatus !== "pending") {
        setStats((prev) => ({
          ...prev,
          pendingReviewCount: Math.max(0, prev.pendingReviewCount - 1),
        }));
      } else if (oldStatus !== "pending" && newStatus === "pending") {
        setStats((prev) => ({
          ...prev,
          pendingReviewCount: prev.pendingReviewCount + 1,
        }));
      }

      toast.success(`Flashcard ${newStatus === "accepted" ? "accepted" : "rejected"} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update flashcard status";
      setFlashcardOperation(id, "statusChange", { isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleEditSave = async (id: string, front: string, back: string) => {
    try {
      setFlashcardOperation(id, "edit", { isLoading: true, error: null });

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ front, back }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      const updatedFlashcard: FlashcardViewModel = await response.json();
      setFlashcards((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                front: updatedFlashcard.front,
                back: updatedFlashcard.back,
                operations: {
                  ...f.operations,
                  edit: { isLoading: false, error: null },
                },
              }
            : f
        )
      );

      setEditModal({ isOpen: false, flashcard: null });
      toast.success("Flashcard updated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update flashcard";
      setFlashcardOperation(id, "edit", { isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.flashcardId) return;

    try {
      const id = deleteModal.flashcardId;
      setFlashcardOperation(id, "delete", { isLoading: true, error: null });

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      setFlashcards((prev) => prev.filter((f) => f.id !== id));
      setDeleteModal({ isOpen: false, flashcardId: null });

      // Update stats
      setStats((prev) => ({
        ...prev,
        currentListTotal: prev.currentListTotal - 1,
      }));

      toast.success("Flashcard deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete flashcard";
      if (deleteModal.flashcardId) {
        setFlashcardOperation(deleteModal.flashcardId, "delete", { isLoading: false, error: errorMessage });
      }
      toast.error(errorMessage);
    }
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
      <ExistingFlashcardList
        flashcards={flashcards}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
      <div className="flex justify-center">
        <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
      </div>

      <EditFlashcardModal
        flashcard={editModal.flashcard}
        isOpen={editModal.isOpen}
        onSave={handleEditSave}
        onCancel={() => setEditModal({ isOpen: false, flashcard: null })}
      />

      <DeleteFlashcardDialog
        isOpen={deleteModal.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, flashcardId: null })}
      />
    </div>
  );
}
