import { useMemo } from "react";
import type { FlashcardProposalViewModel } from "../../types";

export interface FlashcardStats {
  pending: number;
  accepted: number;
  rejected: number;
  edited: number;
}

export function useFlashcardStats(proposals: FlashcardProposalViewModel[]): FlashcardStats {
  return useMemo(() => {
    return proposals.reduce(
      (acc, card) => {
        acc[card.status]++;
        if (card.isEdited) acc.edited++;
        return acc;
      },
      { pending: 0, accepted: 0, rejected: 0, edited: 0 } as FlashcardStats
    );
  }, [proposals]);
}
