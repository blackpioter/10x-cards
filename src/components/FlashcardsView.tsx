import React from "react";
import { useFlashcards } from "./hooks/useFlashcards";
import { ExistingFlashcardList } from "./ExistingFlashcardList";
import { FlashcardFilters } from "./FlashcardFilters";
import { PaginationControls } from "./PaginationControls";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Plus } from "lucide-react";
import { EditFlashcardModal } from "./EditFlashcardModal";
import { CreateFlashcardModal } from "./CreateFlashcardModal";
import { Button } from "./ui/button";
import type { FlashcardViewModel } from "../types";

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

  const [editingFlashcard, setEditingFlashcard] = React.useState<FlashcardViewModel | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const handleUpdateFlashcard = React.useCallback(
    async (id: string, front: string, back: string) => {
      try {
        await updateFlashcard(id, front, back);
        setEditingFlashcard(null); // Close modal after successful update
      } catch (error) {
        console.error("Error updating flashcard:", error);
      }
    },
    [updateFlashcard]
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
        <Button onClick={() => setIsCreateModalOpen(true)}>
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
            onEdit={setEditingFlashcard}
            onDelete={deleteFlashcard}
            onStatusChange={updateFlashcardStatus}
          />

          <div className="mt-8">
            <PaginationControls pagination={pagination} onPageChange={goToPage} />
          </div>
        </>
      )}

      <EditFlashcardModal
        flashcard={editingFlashcard}
        isOpen={editingFlashcard !== null}
        onSave={handleUpdateFlashcard}
        onCancel={() => setEditingFlashcard(null)}
      />

      <CreateFlashcardModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
