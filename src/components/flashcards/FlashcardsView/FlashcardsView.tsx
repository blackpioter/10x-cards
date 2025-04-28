import { useState, useCallback } from "react";
import { useFlashcards } from "./useFlashcards";
import { ExistingFlashcardList } from "../../ExistingFlashcardList";
import { FlashcardFilters } from "../../FlashcardFilters";
import { PaginationControls } from "../../PaginationControls";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus } from "lucide-react";
import { EditFlashcardModal } from "../../EditFlashcardModal";
import { CreateFlashcardModal } from "../../CreateFlashcardModal";
import { Button } from "@/components/ui/button";
import type { FlashcardViewModel } from "@/types";

interface FlashcardsViewState {
  modals: {
    edit: {
      isOpen: boolean;
      flashcard: FlashcardViewModel | null;
    };
    create: {
      isOpen: boolean;
    };
  };
}

const initialState: FlashcardsViewState = {
  modals: {
    edit: {
      isOpen: false,
      flashcard: null,
    },
    create: {
      isOpen: false,
    },
  },
};

export function FlashcardsView() {
  const {
    flashcards,
    pagination,
    isLoading,
    error,
    statusFilter,
    statusCounts,
    updateFlashcardStatus,
    deleteFlashcard,
    updateFlashcard,
    filterByStatus,
    goToPage,
  } = useFlashcards();

  const [state, setState] = useState<FlashcardsViewState>(initialState);

  const handleEditFlashcard = useCallback((flashcard: FlashcardViewModel) => {
    setState((prev) => ({
      ...prev,
      modals: {
        ...prev.modals,
        edit: {
          isOpen: true,
          flashcard,
        },
      },
    }));
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      modals: {
        ...prev.modals,
        edit: {
          isOpen: false,
          flashcard: null,
        },
      },
    }));
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      modals: {
        ...prev.modals,
        create: {
          isOpen: true,
        },
      },
    }));
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      modals: {
        ...prev.modals,
        create: {
          isOpen: false,
        },
      },
    }));
  }, []);

  const handleUpdateFlashcard = useCallback(
    async (id: string, front: string, back: string) => {
      try {
        await updateFlashcard(id, front, back);
        handleCloseEditModal();
      } catch (error) {
        console.error("Error updating flashcard:", error);
      }
    },
    [updateFlashcard, handleCloseEditModal]
  );

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <FlashcardFilters
          statusFilter={statusFilter}
          onStatusFilterChange={filterByStatus}
          counts={statusCounts}
          isLoading={isLoading}
        />
        <Button onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Flashcard
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <ExistingFlashcardList
            flashcards={flashcards}
            onEdit={handleEditFlashcard}
            onDelete={deleteFlashcard}
            onStatusChange={updateFlashcardStatus}
          />

          <div className="mt-8">
            <PaginationControls pagination={pagination} onPageChange={goToPage} />
          </div>
        </>
      )}

      <EditFlashcardModal
        flashcard={state.modals.edit.flashcard}
        isOpen={state.modals.edit.isOpen}
        onSave={handleUpdateFlashcard}
        onCancel={handleCloseEditModal}
      />

      <CreateFlashcardModal isOpen={state.modals.create.isOpen} onClose={handleCloseCreateModal} />
    </div>
  );
}
