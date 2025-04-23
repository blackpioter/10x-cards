import React, { useCallback } from "react";
import type { FlashcardViewModel } from "../types";
import { ExistingFlashcardListItem } from "./ExistingFlashcardListItem";
import type { FlashcardActionStatus } from "../types";

interface ExistingFlashcardListProps {
  flashcards: FlashcardViewModel[];
  onEdit: (flashcard: FlashcardViewModel) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: FlashcardActionStatus) => void;
}

function ExistingFlashcardListComponent({ flashcards, onEdit, onDelete, onStatusChange }: ExistingFlashcardListProps) {
  const handleEdit = useCallback(
    (flashcard: FlashcardViewModel) => {
      onEdit(flashcard);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No flashcards found. Try changing the filter or create new ones.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {flashcards.map((flashcard) => (
        <ExistingFlashcardListItem
          key={flashcard.id}
          flashcard={flashcard}
          onEdit={() => handleEdit(flashcard)}
          onDelete={() => handleDelete(flashcard.id)}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

export const ExistingFlashcardList = React.memo(ExistingFlashcardListComponent, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  if (prevProps.flashcards.length !== nextProps.flashcards.length) {
    return false;
  }

  // Compare each flashcard's essential properties
  return prevProps.flashcards.every((prevFlashcard, index) => {
    const nextFlashcard = nextProps.flashcards[index];
    return (
      prevFlashcard.id === nextFlashcard.id &&
      prevFlashcard.front === nextFlashcard.front &&
      prevFlashcard.back === nextFlashcard.back &&
      prevFlashcard.status === nextFlashcard.status &&
      prevFlashcard.operations.statusChange.isLoading === nextFlashcard.operations.statusChange.isLoading &&
      prevFlashcard.operations.statusChange.error === nextFlashcard.operations.statusChange.error &&
      prevFlashcard.operations.edit.isLoading === nextFlashcard.operations.edit.isLoading &&
      prevFlashcard.operations.edit.error === nextFlashcard.operations.edit.error &&
      prevFlashcard.operations.delete.isLoading === nextFlashcard.operations.delete.isLoading &&
      prevFlashcard.operations.delete.error === nextFlashcard.operations.delete.error
    );
  });
});
