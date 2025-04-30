import { STATUS_MESSAGES } from "../../constants";
import type { GenerationProgressProps } from "../../types";

export function GenerationProgress({ status, progress, onCancel, "data-testid": testId }: GenerationProgressProps) {
  const getStatusMessage = () => {
    switch (status) {
      case "initializing":
        return STATUS_MESSAGES.INITIALIZING;
      case "generating":
        return progress
          ? `${STATUS_MESSAGES.GENERATING} (${progress.current}${progress.total ? `/${progress.total}` : ""})`
          : STATUS_MESSAGES.GENERATING;
      case "finishing":
        return STATUS_MESSAGES.FINISHING;
      default:
        return "Processing...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4" data-testid={testId}>
      <div className="flex items-center space-x-4">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
          data-testid={`${testId}-spinner`}
        />
        <span className="text-lg text-muted-foreground" data-testid={`${testId}-status`}>
          {getStatusMessage()}
        </span>
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid={`${testId}-cancel`}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
