import { useState } from "react";
import type { GenerateViewState, FlashcardProposalDto, FlashcardProposalViewModel } from "../types";
import { TextInputSection } from "./TextInputSection";
import { GenerationProgress } from "./GenerationProgress";
import { FlashcardReviewSection } from "./FlashcardReviewSection";
import { ErrorNotification } from "./common/ErrorNotification";

interface GenerationResponse {
  generation_id: string;
  flashcard_proposals: FlashcardProposalDto[];
}

export function GenerateView() {
  const [state, setState] = useState<GenerateViewState>({
    stage: "input",
  });

  const handleGenerate = async (text: string) => {
    try {
      setState((prev) => ({ ...prev, stage: "generating" }));
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source_text: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const result = (await response.json()) as GenerationResponse;
      setState((prev) => ({
        ...prev,
        stage: "review",
        generationId: result.generation_id,
        proposals: {
          proposals: result.flashcard_proposals.map((proposal) => ({
            id: proposal.id,
            front: proposal.front,
            back: proposal.back,
            status: "pending" as const,
            isEdited: false,
          })),
          stats: {
            total: result.flashcard_proposals.length,
            accepted: 0,
            rejected: 0,
            edited: 0,
          },
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        stage: "input",
        error: error instanceof Error ? error.message : "An unknown error occurred",
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
      setState({ stage: "input" });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }));
    }
  };

  return (
    <div className="space-y-6" data-testid="generate-view">
      {state.error && (
        <ErrorNotification
          error={{
            type: "api",
            message: state.error,
          }}
          onClose={() => setState((prev) => ({ ...prev, error: undefined }))}
          data-testid="error-notification"
        />
      )}

      {state.stage === "input" && (
        <TextInputSection onGenerate={handleGenerate} isGenerating={false} data-testid="text-input-section" />
      )}

      {state.stage === "generating" && <GenerationProgress status="generating" data-testid="generation-progress" />}

      {state.stage === "review" && state.proposals && (
        <FlashcardReviewSection
          flashcards={state.proposals.proposals}
          onComplete={handleComplete}
          data-testid="flashcard-review-section"
        />
      )}
    </div>
  );
}
