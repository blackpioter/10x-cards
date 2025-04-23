import React, { useState, useCallback, useMemo } from "react";
import type { FlashcardViewModel, FlashcardActionStatus, FlashcardStatus } from "../types";
import { ExistingFlashcardList } from "./ExistingFlashcardList";
import { FlashcardForm } from "./FlashcardForm";
import { FlashcardFilters } from "./FlashcardFilters";

interface FlashcardsViewProps {
  flashcards: FlashcardViewModel[];
  onAdd: (front: string, back: string) => void;
  onEdit: (flashcard: FlashcardViewModel) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: FlashcardActionStatus) => void;
}

export function FlashcardsView({ flashcards, onAdd, onEdit, onDelete, onStatusChange }: FlashcardsViewProps) {
  const [textFilter, setTextFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<FlashcardStatus>("all");

  const handleTextFilterChange = useCallback((newFilter: string) => {
    setTextFilter(newFilter);
  }, []);

  const handleStatusFilterChange = useCallback((newStatus: FlashcardStatus) => {
    setStatusFilter(newStatus);
  }, []);

  const filteredFlashcards = useMemo(() => {
    return flashcards.filter((flashcard) => {
      // Apply status filter
      if (statusFilter !== "all" && flashcard.status !== statusFilter) {
        return false;
      }

      // Apply text filter
      if (textFilter) {
        const searchTerm = textFilter.toLowerCase();
        return flashcard.front.toLowerCase().includes(searchTerm) || flashcard.back.toLowerCase().includes(searchTerm);
      }

      return true;
    });
  }, [flashcards, textFilter, statusFilter]);

  const handleAdd = useCallback(
    (front: string, back: string) => {
      onAdd(front, back);
    },
    [onAdd]
  );

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

  const handleStatusChange = useCallback(
    (id: string, newStatus: FlashcardActionStatus) => {
      onStatusChange(id, newStatus);
    },
    [onStatusChange]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <FlashcardForm onSubmit={handleAdd} />
      </div>
      <div className="mb-4">
        <FlashcardFilters
          textFilter={textFilter}
          onTextFilterChange={handleTextFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />
      </div>
      <ExistingFlashcardList
        flashcards={filteredFlashcards}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
