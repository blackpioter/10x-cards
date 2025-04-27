interface GenerationProgressProps {
  status: "initializing" | "generating" | "finishing";
  progress?: {
    current: number;
    total?: number;
  };
  onCancel?: () => void;
}

export function GenerationProgress({ status, progress, onCancel }: GenerationProgressProps) {
  const getStatusMessage = () => {
    switch (status) {
      case "initializing":
        return "Preparing to generate flashcards...";
      case "generating":
        return progress
          ? `Generating flashcards (${progress.current}${progress.total ? `/${progress.total}` : ""})...`
          : "Generating flashcards...";
      case "finishing":
        return "Finalizing generation...";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4" data-testid="generation-progress">
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" data-testid="loading-spinner" />
        <span className="text-lg text-muted-foreground" data-testid="generation-status">
          {getStatusMessage()}
        </span>
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="cancel-generation"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
