import { useState } from "react";
import type { GenerateViewState, FlashcardProposalDto, FlashcardProposalViewModel } from "../types";
import { TextInputSection } from "./TextInputSection";
import { GenerationProgress } from "./GenerationProgress";
import { FlashcardReviewSection } from "./FlashcardReviewSection";
import { ErrorNotification } from "./ErrorNotification";

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
      // Group flashcards by their current status
      const acceptedIds = proposals.filter((card) => card.status === "accepted").map((card) => card.id);
      const rejectedIds = proposals.filter((card) => card.status === "rejected").map((card) => card.id);
      const pendingIds = proposals.filter((card) => card.status === "pending").map((card) => card.id);

      // Update accepted flashcards
      if (acceptedIds.length > 0) {
        const acceptResponse = await fetch("/api/flashcards/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flashcard_ids: acceptedIds,
            status: "accepted",
          }),
        });

        if (!acceptResponse.ok) {
          throw new Error("Failed to update accepted flashcards");
        }
      }

      // Update rejected flashcards
      if (rejectedIds.length > 0) {
        const rejectResponse = await fetch("/api/flashcards/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flashcard_ids: rejectedIds,
            status: "rejected",
          }),
        });

        if (!rejectResponse.ok) {
          throw new Error("Failed to update rejected flashcards");
        }
      }

      // Update pending flashcards
      if (pendingIds.length > 0) {
        const pendingResponse = await fetch("/api/flashcards/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flashcard_ids: pendingIds,
            status: "pending",
          }),
        });

        if (!pendingResponse.ok) {
          throw new Error("Failed to update pending flashcards");
        }
      }

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
