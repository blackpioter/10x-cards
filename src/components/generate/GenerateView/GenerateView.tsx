import * as React from "react";
import { useGenerate } from "./hooks/useGenerate";
import { TextInputSection } from "./components/TextInputSection";
import { GenerationProgress } from "./components/GenerationProgress";
import { FlashcardReviewSection } from "./components/FlashcardReviewSection";
import { ErrorNotification } from "../../common/ErrorNotification";
import { CompletionModal } from "./components/CompletionModal";
import { logger } from "@/lib/logger";
import { TEST_IDS, STATES } from "./constants";
import type { LocalErrorState } from "./types";

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
    <div className="space-y-6" data-testid={TEST_IDS.GENERATE_VIEW}>
      {state.error && (
        <ErrorNotification
          error={
            {
              type: "api",
              message: state.error,
              timestamp: Date.now(),
            } satisfies LocalErrorState
          }
          onClose={clearError}
        />
      )}

      {state.stage === STATES.INPUT && <TextInputSection onGenerate={handleGenerate} isGenerating={false} />}

      {state.stage === STATES.GENERATING && <GenerationProgress status="generating" />}

      {state.stage === STATES.REVIEW && state.proposals && (
        <FlashcardReviewSection flashcards={state.proposals.proposals} onComplete={handleComplete} />
      )}

      <CompletionModal
        isOpen={state.stage === STATES.COMPLETED}
        onGenerateNew={handleGenerateNew}
        onViewAll={handleViewAll}
      />
    </div>
  );
}
