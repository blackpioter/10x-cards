import { useState } from "react";
import type {
  GenerateViewState,
  FlashcardProposalViewModel,
  FlashcardProposalListViewModel,
  FlashcardProposalDto,
  GenerationCreateResponseDto,
} from "../../../types";

const STATES = {
  INPUT: "input",
  GENERATING: "generating",
  REVIEW: "review",
} as const;

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
        const error = await response.json();
        throw new Error(error.error || "Failed to generate flashcards");
      }

      const data: GenerationCreateResponseDto = await response.json();

      const proposalViewModels: FlashcardProposalViewModel[] = data.flashcard_proposals.map(
        (proposal: FlashcardProposalDto) => ({
          ...proposal,
          status: "pending",
          isEdited: false,
          isSelected: true,
        })
      );

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

  /**
   * Handles completion of the flashcard generation process.
   */
  const handleComplete = async () => {
    if (!state.generationId) {
      setState((prev) => ({
        ...prev,
        error: "Generation ID is missing",
      }));
      return;
    }

    try {
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
