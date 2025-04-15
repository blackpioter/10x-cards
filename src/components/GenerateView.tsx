import { useState } from "react";
import type { GenerateViewState, FlashcardProposalDto, FlashcardProposalViewModel } from "../types";
import { TextInputSection } from "./TextInputSection";
import { GenerationProgress } from "./GenerationProgress";
import { FlashcardReviewSection } from "./FlashcardReviewSection";
import { ErrorNotification } from "./ErrorNotification";

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

      const result = await response.json();
      setState((prev) => ({
        ...prev,
        stage: "review",
        generationId: result.generation_id,
        proposals: {
          proposals: result.flashcard_proposals.map((proposal: FlashcardProposalDto) => ({
            id: crypto.randomUUID(),
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

  const handleComplete = async (accepted: FlashcardProposalViewModel[]) => {
    if (!state.generationId) {
      setState((prev) => ({
        ...prev,
        error: "Generation ID is missing",
      }));
      return;
    }

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards: accepted.map((card) => ({
            front: card.front,
            back: card.back,
            source: card.isEdited ? "ai-edited" : "ai-full",
            generation_id: state.generationId,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards");
      }

      // Reset to input stage after successful save
      setState({ stage: "input" });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }));
    }
  };

  return (
    <div className="space-y-6">
      {state.error && (
        <ErrorNotification
          error={{
            type: "api",
            message: state.error,
          }}
          onClose={() => setState((prev) => ({ ...prev, error: undefined }))}
        />
      )}

      {state.stage === "input" && <TextInputSection onGenerate={handleGenerate} isGenerating={false} />}

      {state.stage === "generating" && <GenerationProgress status="generating" />}

      {state.stage === "review" && state.proposals && (
        <FlashcardReviewSection flashcards={state.proposals.proposals} onComplete={handleComplete} />
      )}
    </div>
  );
}
