import { useState } from "react";
import type {
  GenerateViewState,
  FlashcardProposalDto,
  FlashcardProposalViewModel,
  FlashcardProposalListViewModel,
} from "../../../types";

const STATES = {
  INPUT: "input",
  GENERATING: "generating",
  REVIEW: "review",
} as const;

interface GenerationResponse {
  generation_id: string;
  flashcard_proposals: FlashcardProposalDto[];
}

export function useGenerate() {
  const [state, setState] = useState<GenerateViewState>({
    stage: STATES.INPUT,
    error: undefined,
    proposals: undefined,
  });

  const handleGenerate = async (sourceText: string) => {
    try {
      setState((prev) => ({ ...prev, stage: STATES.GENERATING, error: undefined }));

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source_text: sourceText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data: GenerationResponse = await response.json();

      const proposalViewModels: FlashcardProposalViewModel[] = data.flashcard_proposals.map((proposal) => ({
        ...proposal,
        status: "pending",
        isEdited: false,
        isSelected: true,
      }));

      const proposalList: FlashcardProposalListViewModel = {
        proposals: proposalViewModels,
        stats: {
          total: proposalViewModels.length,
          accepted: 0,
          rejected: 0,
          edited: 0,
        },
      };

      setState((prev) => ({
        ...prev,
        stage: STATES.REVIEW,
        proposals: proposalList,
        generationId: data.generation_id,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        stage: STATES.INPUT,
        error: error instanceof Error ? error.message : "An error occurred",
      }));
    }
  };

  const handleComplete = async (proposals: FlashcardProposalViewModel[]) => {
    if (!state.generationId) {
      setState((prev) => ({
        ...prev,
        error: "Generation ID is missing",
      }));
      return;
    }

    try {
      // Update each flashcard individually
      const updatePromises = proposals.map(async (card) => {
        const response = await fetch(`/api/flashcards/${card.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: card.status,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update flashcard ${card.id}`);
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Reset to input stage after successful updates
      setState({
        stage: STATES.INPUT,
        error: undefined,
        proposals: undefined,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }));
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: undefined }));
  };

  return {
    state,
    handleGenerate,
    handleComplete,
    clearError,
  };
}
