import * as React from "react";
import type { FlashcardProposalViewModel } from "../../types";
import { useFlashcardStats } from "./useFlashcardStats";

export function useFlashcardReview(
  initialFlashcards: FlashcardProposalViewModel[],
  onComplete: (proposals: FlashcardProposalViewModel[]) => void
) {
  const [proposals, setProposals] = React.useState<FlashcardProposalViewModel[]>(initialFlashcards);
  const [filter, setFilter] = React.useState<"all" | "accepted" | "rejected">("all");
  const [pendingUpdates, setPendingUpdates] = React.useState<Map<string, "accepted" | "rejected" | "pending">>(
    new Map()
  );

  const stats = useFlashcardStats(proposals);

  const updateFlashcardStatus = React.useCallback(async (updates: Map<string, "accepted" | "rejected" | "pending">) => {
    try {
      // Convert Map to array of updates
      const updatePromises = Array.from(updates.entries()).map(([id, status]) =>
        fetch(`/api/flashcards/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        })
      );

      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter((r) => !r.ok);

      if (failedUpdates.length > 0) {
        throw new Error(`Failed to update ${failedUpdates.length} flashcards`);
      }
    } catch (error) {
      console.error("Error updating flashcard statuses:", error);
      throw error;
    }
  }, []);

  // Automatically save changes when we have accumulated a few updates or after a delay
  React.useEffect(() => {
    if (pendingUpdates.size === 0) return;

    const timeoutId = setTimeout(() => {
      updateFlashcardStatus(pendingUpdates)
        .then(() => {
          setPendingUpdates(new Map());
        })
        .catch(console.error);
    }, 2000); // Save changes after 2 seconds of inactivity

    // If we have accumulated enough updates, save immediately
    if (pendingUpdates.size >= 5) {
      updateFlashcardStatus(pendingUpdates)
        .then(() => {
          setPendingUpdates(new Map());
        })
        .catch(console.error);
      clearTimeout(timeoutId);
    }

    return () => clearTimeout(timeoutId);
  }, [pendingUpdates, updateFlashcardStatus]);

  const handleItemAction = React.useCallback(
    async (action: {
      type: "accept" | "reject" | "edit" | "reset" | "restore";
      proposalId: string;
      editedContent?: { front: string; back: string };
    }) => {
      try {
        // Update local state immediately
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

        // Add status change to pending updates
        if (action.type === "accept" || action.type === "reject" || action.type === "reset") {
          const status = action.type === "accept" ? "accepted" : action.type === "reject" ? "rejected" : "pending";
          setPendingUpdates((prev) => new Map(prev).set(action.proposalId, status));
        }

        // Check if all cards have been reviewed
        const updatedProposals = proposals.map((card) =>
          card.id === action.proposalId
            ? ({
                ...card,
                status: action.type === "accept" ? "accepted" : action.type === "reject" ? "rejected" : "pending",
              } as FlashcardProposalViewModel)
            : card
        );

        if (!updatedProposals.some((card) => card.status === "pending")) {
          // Save any pending updates before completing
          if (pendingUpdates.size > 0) {
            await updateFlashcardStatus(pendingUpdates);
            setPendingUpdates(new Map());
          }
          onComplete(updatedProposals);
        }
      } catch (error) {
        console.error("Failed to update flashcard:", error);
      }
    },
    [proposals, pendingUpdates, updateFlashcardStatus, onComplete]
  );

  const handleBulkAction = React.useCallback(async () => {
    try {
      const pendingCards = proposals.filter((card) => card.status === "pending");

      // Update local state
      setProposals((prev) =>
        prev.map((card) => ({
          ...card,
          status: "accepted" as const,
        }))
      );

      // Add all updates to pending updates
      const updates = new Map(pendingCards.map((card) => [card.id, "accepted" as const]));
      await updateFlashcardStatus(updates);

      const updatedProposals = proposals.map((card) => ({
        ...card,
        status: "accepted" as const,
      }));

      onComplete(updatedProposals);
    } catch (error) {
      console.error("Failed to accept all flashcards:", error);
    }
  }, [proposals, updateFlashcardStatus, onComplete]);

  const filteredProposals = React.useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((card) => card.status === filter);
  }, [proposals, filter]);

  return {
    proposals,
    stats,
    filter,
    setFilter,
    handleItemAction,
    handleBulkAction,
    filteredProposals,
  };
}
