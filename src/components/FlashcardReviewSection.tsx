import * as React from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardProposalViewModel } from "../types";
import { FlashcardList } from "./FlashcardList";

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
  const [proposals, setProposals] = React.useState<FlashcardProposalViewModel[]>(flashcards);
  const [filter, setFilter] = React.useState<"all" | "accepted" | "rejected">("all");

  const stats = React.useMemo(() => {
    return proposals.reduce(
      (acc, card) => {
        acc[card.status]++;
        if (card.isEdited) acc.edited++;
        return acc;
      },
      { pending: 0, accepted: 0, rejected: 0, edited: 0 }
    );
  }, [proposals]);

  const updateFlashcardStatus = React.useCallback(async (id: string, status: "accepted" | "rejected" | "pending") => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update flashcard ${id}`);
      }
    } catch (error) {
      console.error("Error updating flashcard status:", error);
      throw error;
    }
  }, []);

  const handleItemAction = React.useCallback(
    async (action: {
      type: "accept" | "reject" | "edit" | "reset" | "restore";
      proposalId: string;
      editedContent?: { front: string; back: string };
    }) => {
      try {
        // First update the backend if it's a status change
        if (action.type === "accept" || action.type === "reject" || action.type === "reset") {
          const status = action.type === "accept" ? "accepted" : action.type === "reject" ? "rejected" : "pending";
          await updateFlashcardStatus(action.proposalId, status);
        }

        // Then update the local state
        setProposals((prev) =>
          prev.map((card) => {
            if (card.id !== action.proposalId) return card;

            switch (action.type) {
              case "accept":
                return { ...card, status: "accepted" as const };
              case "reject":
                return { ...card, status: "rejected" as const };
              case "edit":
                if (!action.editedContent) return card;
                return {
                  ...card,
                  front: action.editedContent.front,
                  back: action.editedContent.back,
                  isEdited: true,
                  originalContent: card.originalContent || {
                    front: card.front,
                    back: card.back,
                  },
                };
              case "reset":
                return {
                  ...card,
                  status: "pending" as const,
                };
              case "restore":
                return {
                  ...card,
                  front: card.originalContent?.front || card.front,
                  back: card.originalContent?.back || card.back,
                  isEdited: false,
                  originalContent: undefined,
                };
              default:
                return card;
            }
          })
        );
      } catch (error) {
        console.error("Failed to update flashcard:", error);
        // You might want to show an error notification here
      }
    },
    [updateFlashcardStatus]
  );

  const handleBulkAction = React.useCallback(
    async (action: "accept-all" | "save-accepted") => {
      if (action === "accept-all") {
        try {
          // Update all pending cards to accepted in parallel
          const pendingCards = proposals.filter((card) => card.status === "pending");
          await Promise.all(pendingCards.map((card) => updateFlashcardStatus(card.id, "accepted")));

          setProposals((prev) =>
            prev.map((card) => ({
              ...card,
              status: "accepted" as const,
            }))
          );
        } catch (error) {
          console.error("Failed to accept all flashcards:", error);
          // You might want to show an error notification here
        }
      } else if (action === "save-accepted") {
        onComplete(proposals);
      }
    },
    [proposals, onComplete, updateFlashcardStatus]
  );

  const filteredProposals = React.useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((card) => card.status === filter);
  }, [proposals, filter]);

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
