import * as React from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardProposalViewModel } from "../../../../../types";
import { FlashcardList } from "@/components/FlashcardList";
import { useFlashcardReview } from "../../hooks";
import { TEST_IDS } from "../../constants";

interface FlashcardReviewSectionProps {
  flashcards: FlashcardProposalViewModel[];
  onComplete: (proposals: FlashcardProposalViewModel[]) => void;
}

export function FlashcardReviewSection({ flashcards, onComplete }: FlashcardReviewSectionProps) {
  const { proposals, stats, filter, setFilter, handleItemAction, handleBulkAction, filteredProposals } =
    useFlashcardReview(flashcards, onComplete);

  return (
    <div className="space-y-6" data-testid={TEST_IDS.REVIEW_SECTION.CONTAINER}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Review Flashcards</h2>
          <p className="text-sm text-muted-foreground">Review and edit the generated flashcards before saving them.</p>
        </div>
        <div className="flex items-center space-x-2" data-testid={TEST_IDS.REVIEW_SECTION.STATS.CONTAINER}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-muted" : ""}
            data-testid={TEST_IDS.REVIEW_SECTION.FILTERS.ALL}
          >
            All ({proposals.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("accepted")}
            className={filter === "accepted" ? "bg-muted" : ""}
            data-testid={TEST_IDS.REVIEW_SECTION.FILTERS.ACCEPTED}
          >
            Accepted ({stats.accepted})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("rejected")}
            className={filter === "rejected" ? "bg-muted" : ""}
            data-testid={TEST_IDS.REVIEW_SECTION.FILTERS.REJECTED}
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
        data-testid={TEST_IDS.REVIEW_SECTION.LIST}
      />
    </div>
  );
}
