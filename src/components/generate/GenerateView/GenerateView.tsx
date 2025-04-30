import { useGenerate } from "./useGenerate";
import { TextInputSection } from "../../TextInputSection";
import { GenerationProgress } from "../../GenerationProgress";
import { FlashcardReviewSection } from "./FlashcardReviewSection";
import { ErrorNotification } from "../../common/ErrorNotification";
import { CompletionModal } from "./CompletionModal";
import * as React from "react";
import { logger } from "@/lib/logger";

export function GenerateView() {
  const { state, handleGenerate, handleComplete, handleGenerateNew, handleViewAll, clearError } = useGenerate();

  React.useEffect(() => {
    logger.debug("[GenerateView] State changed:", {
      stage: state.stage,
      hasProposals: !!state.proposals,
      error: state.error,
    });
  }, [state]);

  return (
    <div className="space-y-6" data-testid="generate-view">
      {state.error && (
        <ErrorNotification
          error={{
            type: "api",
            message: state.error,
          }}
          onClose={clearError}
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

      <CompletionModal
        isOpen={state.stage === "completed"}
        onGenerateNew={handleGenerateNew}
        onViewAll={handleViewAll}
      />
    </div>
  );
}
