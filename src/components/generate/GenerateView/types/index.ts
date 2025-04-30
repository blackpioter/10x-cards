import type { FlashcardProposalViewModel, FlashcardProposalListViewModel, ErrorState } from "@/types";

// Component Props Types
export interface TextInputSectionProps {
  onGenerate: (text: string) => Promise<void>;
  isGenerating: boolean;
  "data-testid"?: string;
}

export interface GenerationProgressProps {
  status: GenerationStatus;
  progress?: {
    current: number;
    total?: number;
  };
  onCancel?: () => void;
  "data-testid"?: string;
}

export interface FlashcardReviewSectionProps {
  flashcards: FlashcardProposalViewModel[];
  onComplete: (proposals: FlashcardProposalViewModel[]) => void;
  "data-testid"?: string;
}

export interface CompletionModalProps {
  isOpen: boolean;
  onGenerateNew: () => void;
  onViewAll: () => void;
}

// Local View Types
export type GenerationStatus = "initializing" | "generating" | "finishing";

// Local Hook Types
export interface UseGenerateReturn {
  state: LocalGenerateViewState;
  handleGenerate: (text: string) => Promise<void>;
  handleComplete: (proposals: FlashcardProposalViewModel[]) => void;
  handleGenerateNew: () => void;
  handleViewAll: () => void;
  clearError: () => void;
}

export interface LocalGenerateViewState {
  stage: GenerateViewStage;
  error?: string;
  proposals?: FlashcardProposalListViewModel;
  generationId?: string;
}

export type GenerateViewStage = "input" | "generating" | "review" | "completed";

// Error Types
export interface LocalErrorState extends ErrorState {
  timestamp: number; // Rozszerzamy globalny typ o wymagane pole timestamp
}
