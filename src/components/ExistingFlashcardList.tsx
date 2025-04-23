import type { FlashcardViewModel } from "../types";
import { ExistingFlashcardListItem } from "./ExistingFlashcardListItem";

interface ExistingFlashcardListProps {
  flashcards: FlashcardViewModel[];
  onEdit: (flashcard: FlashcardViewModel) => void;
  onDelete: (id: string) => void;
}

export function ExistingFlashcardList({ flashcards, onEdit, onDelete }: ExistingFlashcardListProps) {
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
          onEdit={() => onEdit(flashcard)}
          onDelete={() => onDelete(flashcard.id)}
        />
      ))}
    </div>
  );
}
