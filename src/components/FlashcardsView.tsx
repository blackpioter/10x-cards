import React from "react";
import { useFlashcards } from "./hooks/useFlashcards";
import { ExistingFlashcardList } from "./ExistingFlashcardList";
import { FlashcardForm } from "./FlashcardForm";
import { FlashcardFilters } from "./FlashcardFilters";
import FlashcardStats from "./FlashcardStats";
import { PaginationControls } from "./PaginationControls";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";

export function FlashcardsView() {
  const {
    flashcards,
    pagination,
    isLoading,
    error,
    stats,
    statusFilter,
    updateFlashcardStatus,
    deleteFlashcard,
    updateFlashcard,
    filterByStatus,
    goToPage,
  } = useFlashcards();

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <FlashcardStats currentListTotal={stats.currentListTotal} pendingReviewCount={stats.pendingReviewCount} />

      <div className="mb-8">
        <FlashcardForm
          onSubmit={async (front, back) => {
            try {
              const response = await fetch("/api/flashcards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  flashcards: [
                    {
                      front,
                      back,
                      source: "manual",
                      generation_id: null,
                    },
                  ],
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to create flashcard");
              }

              // Refresh the list
              window.location.reload();
            } catch (error) {
              console.error("Error creating flashcard:", error);
            }
          }}
        />
      </div>

      <div className="mb-4">
        <FlashcardFilters statusFilter={statusFilter} onStatusFilterChange={filterByStatus} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <ExistingFlashcardList
            flashcards={flashcards}
            onEdit={(flashcard) => updateFlashcard(flashcard.id, flashcard.front, flashcard.back)}
            onDelete={deleteFlashcard}
            onStatusChange={updateFlashcardStatus}
          />

          <div className="mt-8">
            <PaginationControls pagination={pagination} onPageChange={goToPage} />
          </div>
        </>
      )}
    </div>
  );
}
