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
   * @param proposals - List of flashcard proposals. Used for logging completion stats.
   */
  const handleComplete = async (proposals: FlashcardProposalViewModel[]) => {
    if (!state.generationId) {
      setState((prev) => ({
        ...prev,
        error: "Generation ID is missing",
      }));
      return;
    }

    try {
      // Log completion stats for debugging
      console.debug("Completing generation", {
        generationId: state.generationId,
        totalProposals: proposals.length,
        accepted: proposals.filter((p) => p.status === "accepted").length,
        rejected: proposals.filter((p) => p.status === "rejected").length,
        edited: proposals.filter((p) => p.isEdited).length,
      });

      // Note: We don't need to manually update flashcard statuses here
      // The backend (generation.service.ts) handles this when saving to Supabase

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
