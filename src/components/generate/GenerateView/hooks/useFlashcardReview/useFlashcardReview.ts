import * as React from "react";
import type { FlashcardProposalViewModel } from "../../../../../types";
import { useFlashcardStats } from "../useFlashcardStats/useFlashcardStats";
import { logger } from "@/lib/logger";

export function useFlashcardReview(
  initialFlashcards: FlashcardProposalViewModel[],
  onComplete: (proposals: FlashcardProposalViewModel[]) => void
) {
  const [proposals, setProposals] = React.useState<FlashcardProposalViewModel[]>(initialFlashcards);
  const [filter, setFilter] = React.useState<"all" | "accepted" | "rejected">("all");
  const [pendingUpdates, setPendingUpdates] = React.useState<Map<string, "accepted" | "rejected" | "pending">>(
    new Map()
  );
  const [isCompleting, setIsCompleting] = React.useState(false);

  const stats = useFlashcardStats(proposals);

  const completeReview = React.useCallback(async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      // Wait for any pending updates to complete
      if (pendingUpdates.size > 0) {
        await updateFlashcardStatus(pendingUpdates);
        setPendingUpdates(new Map());
      }

      // Double check the state after updates
      const pendingCards = proposals.filter((card) => card.status === "pending");
      if (pendingCards.length > 0) {
        logger.debug("Found pending cards after updates, aborting completion");
        setIsCompleting(false);
        return;
      }

      onComplete(proposals);
    } catch (error) {
      logger.error("Failed to complete review:", error);
      setIsCompleting(false);
    }
  }, [proposals, pendingUpdates, onComplete, isCompleting]);

  // Effect to check if all cards have been reviewed
  React.useEffect(() => {
    const pendingCards = proposals.filter((card) => card.status === "pending");
    const totalCards = proposals.length;
    const reviewedCards = proposals.filter((card) => card.status === "accepted" || card.status === "rejected").length;

    if (totalCards > 0 && pendingCards.length === 0 && reviewedCards === totalCards) {
      completeReview();
    }
  }, [proposals, completeReview]);

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
        }).then(async (response) => {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to update flashcard ${id}: ${error.error || "Unknown error"}`);
          }
          return response;
        })
      );

      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      logger.error("Error updating flashcard statuses:", error);
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
        .catch((error) => logger.error("Failed to save changes:", error));
    }, 2000); // Save changes after 2 seconds of inactivity

    // If we have accumulated enough updates, save immediately
    if (pendingUpdates.size >= 5) {
      updateFlashcardStatus(pendingUpdates)
        .then(() => {
          setPendingUpdates(new Map());
        })
        .catch((error) => logger.error("Failed to save changes:", error));
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
        let newStatus: "accepted" | "rejected" | "pending" | undefined;

        // Determine the new status based on action type
        if (action.type === "accept") newStatus = "accepted";
        else if (action.type === "reject") newStatus = "rejected";
        else if (action.type === "reset") newStatus = "pending";

        // Update local state immediately
        setProposals((prevProposals) => {
          const updatedProposals = prevProposals.map((card) => {
            if (card.id !== action.proposalId) return card;

            return (() => {
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
            })();
          });

          return updatedProposals;
        });

        // Update pending updates outside of setProposals callback
        if (newStatus) {
          setPendingUpdates((prev) => {
            const newUpdates = new Map(prev).set(action.proposalId, newStatus);
            return newUpdates;
          });
        }
      } catch (error) {
        logger.error("Failed to update flashcard:", error);
      }
    },
    []
  );

  const handleBulkAction = React.useCallback(async () => {
    try {
      // Get current pending cards before state update
      const pendingCards = proposals.filter((card) => card.status === "pending");

      // Update local state
      setProposals((prev) => {
        const updatedProposals = prev.map((card) => ({
          ...card,
          status: "accepted" as const,
        }));

        return updatedProposals;
      });

      // Create updates map
      const updates = new Map(pendingCards.map((card) => [card.id, "accepted" as const]));

      // Update pending updates
      setPendingUpdates((prev) => {
        const newUpdates = new Map(prev);
        for (const [id, status] of updates) {
          newUpdates.set(id, status);
        }
        return newUpdates;
      });
    } catch (error) {
      logger.error("Failed to accept all flashcards:", error);
    }
  }, [proposals]);

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
