import * as React from "react";
import { Button } from "@/components/ui/button";
import type { FlashcardProposalViewModel } from "../types";
import { FlashcardList } from "./FlashcardList";

interface FlashcardReviewSectionProps {
  flashcards: FlashcardProposalViewModel[];
  onComplete: (accepted: FlashcardProposalViewModel[]) => void;
  generationId: string;
}

export function FlashcardReviewSection({ flashcards, onComplete, generationId }: FlashcardReviewSectionProps) {
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

  const handleItemAction = React.useCallback(
    (action: {
      type: "accept" | "reject" | "edit";
      proposalId: string;
      editedContent?: { front: string; back: string };
    }) => {
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
            default:
              return card;
          }
        })
      );
    },
    []
  );

  const handleBulkAction = React.useCallback(
    (action: "accept-all" | "save-accepted") => {
      if (action === "accept-all") {
        setProposals((prev) =>
          prev.map((card) => ({
            ...card,
            status: "accepted" as const,
          }))
        );
      } else if (action === "save-accepted") {
        const acceptedCards = proposals.filter((card) => card.status === "accepted");
        onComplete(acceptedCards);
      }
    },
    [proposals, onComplete]
  );

  const filteredProposals = React.useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((card) => card.status === filter);
  }, [proposals, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Review Flashcards</h2>
          <p className="text-sm text-muted-foreground">Review and edit the generated flashcards before saving them.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-muted" : ""}
          >
            All ({proposals.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("accepted")}
            className={filter === "accepted" ? "bg-muted" : ""}
          >
            Accepted ({stats.accepted})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("rejected")}
            className={filter === "rejected" ? "bg-muted" : ""}
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
      />

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => handleBulkAction("accept-all")}
          disabled={proposals.every((p) => p.status === "accepted")}
        >
          Accept All
        </Button>
        <Button onClick={() => handleBulkAction("save-accepted")} disabled={!stats.accepted}>
          Save Accepted ({stats.accepted})
        </Button>
      </div>
    </div>
  );
}
