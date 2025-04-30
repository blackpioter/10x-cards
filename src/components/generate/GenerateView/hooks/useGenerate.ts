import * as React from "react";
import type {
  GenerateViewState,
  FlashcardProposalViewModel,
  FlashcardProposalListViewModel,
  FlashcardProposalDto,
  GenerationCreateResponseDto,
} from "@/types";

type Stage = GenerateViewState["stage"];

const STATES: Record<string, Stage> = {
  INPUT: "input",
  GENERATING: "generating",
  REVIEW: "review",
  COMPLETED: "completed",
} as const;

export function useGenerate() {
  const [state, setState] = React.useState<GenerateViewState>({
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

  const handleComplete = async (proposals: FlashcardProposalViewModel[]) => {
    console.log("[useGenerate] handleComplete called with proposals:", proposals.length);
    console.log("[useGenerate] Current state:", state.stage);

    // Immediately set the completed state
    setState((prev) => {
      console.log("[useGenerate] Setting completed state from:", prev.stage);

      if (!prev.proposals) {
        console.log("[useGenerate] No proposals in state, this should not happen");
        return prev;
      }

      const newState: GenerateViewState = {
        ...prev,
        stage: STATES.COMPLETED,
        proposals: {
          ...prev.proposals,
          proposals,
        },
      };

      console.log("[useGenerate] New state will be:", newState.stage);
      return newState;
    });
  };

  const handleGenerateNew = () => {
    console.log("[useGenerate] handleGenerateNew called");
    setState({
      stage: STATES.INPUT,
      error: undefined,
      proposals: undefined,
    });
  };

  const handleViewAll = () => {
    console.log("[useGenerate] handleViewAll called");
    window.location.href = "/flashcards";
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: undefined }));
  };

  return {
    state,
    handleGenerate,
    handleComplete,
    handleGenerateNew,
    handleViewAll,
    clearError,
  };
}
