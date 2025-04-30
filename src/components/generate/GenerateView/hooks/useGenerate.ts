import * as React from "react";
import { logger } from "@/lib/logger";
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
      logger.info("[useGenerate] Starting generation with source text length:", sourceText.length);
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
        logger.error("[useGenerate] Generation failed", { status: response.status, error });
        throw new Error(error.error || "Failed to generate flashcards");
      }

      const data: GenerationCreateResponseDto = await response.json();
      logger.debug("[useGenerate] Generation successful", {
        generationId: data.generation_id,
        proposalsCount: data.flashcard_proposals.length,
      });

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
      logger.error("[useGenerate] Error during generation", error);
      setState((prev) => ({
        ...prev,
        stage: STATES.INPUT,
        error: error instanceof Error ? error.message : "An error occurred",
      }));
    }
  };

  const handleComplete = async (proposals: FlashcardProposalViewModel[]) => {
    logger.info("[useGenerate] Completing review", {
      proposalsCount: proposals.length,
      currentStage: state.stage,
    });

    setState((prev) => {
      if (!prev.proposals) {
        logger.warn("[useGenerate] No proposals in state during completion");
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

      logger.debug("[useGenerate] State updated to completed", {
        previousStage: prev.stage,
        newStage: newState.stage,
        proposalsCount: proposals.length,
      });

      return newState;
    });
  };

  const handleGenerateNew = () => {
    logger.info("[useGenerate] Starting new generation");
    setState({
      stage: STATES.INPUT,
      error: undefined,
      proposals: undefined,
    });
  };

  const handleViewAll = () => {
    logger.info("[useGenerate] Navigating to flashcards view");
    window.location.href = "/flashcards";
  };

  const clearError = () => {
    logger.debug("[useGenerate] Clearing error state");
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
