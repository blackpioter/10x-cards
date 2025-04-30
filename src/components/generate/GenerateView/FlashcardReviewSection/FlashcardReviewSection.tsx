import * as React from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardProposalViewModel } from "../../../../types";
import { FlashcardList } from "../../../FlashcardList";
import { useFlashcardReview } from "../hooks";

interface FlashcardReviewSectionProps {
  flashcards: FlashcardProposalViewModel[];
  onComplete: (proposals: FlashcardProposalViewModel[]) => void;
  "data-testid"?: string;
}

export function FlashcardReviewSection({
  flashcards,
  onComplete,
  "data-testid": testId = "flashcard-review-section",
}: FlashcardReviewSectionProps) {
  const { proposals, stats, filter, setFilter, handleItemAction, handleBulkAction, filteredProposals } =
    useFlashcardReview(flashcards, onComplete);

  return (
    <div className="space-y-6" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Review Flashcards</h2>
          <p className="text-sm text-muted-foreground">Review and edit the generated flashcards before saving them.</p>
        </div>
        <div className="flex items-center space-x-2" data-testid="filter-buttons">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-muted" : ""}
            data-testid="filter-all"
          >
            All ({proposals.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("accepted")}
            className={filter === "accepted" ? "bg-muted" : ""}
            data-testid="filter-accepted"
          >
            Accepted ({stats.accepted})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("rejected")}
            className={filter === "rejected" ? "bg-muted" : ""}
            data-testid="filter-rejected"
          >
            Rejected ({stats.rejected})
          </Button>
        </div>
      </div>

      <FlashcardList
        proposals={filteredProposals}
        onItemAction={handleItemAction}
        onBulkAction={handleBulkAction}
        stats={stats}
        data-testid="flashcard-list"
      />
    </div>
  );
}
