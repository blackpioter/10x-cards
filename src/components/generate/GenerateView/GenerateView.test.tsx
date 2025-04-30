import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenerateView } from "./GenerateView";
import { useGenerate } from "./hooks/useGenerate";
import "@testing-library/jest-dom";
import type { FlashcardProposalViewModel } from "@/types";

// Mock the logger
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Interfejsy dla mocków komponentów
interface TextInputSectionProps {
  onGenerate: (text: string) => void;
  isGenerating?: boolean;
}

interface GenerationProgressProps {
  status: string;
}

interface FlashcardReviewSectionProps {
  flashcards: FlashcardProposalViewModel[];
  onComplete: (flashcards: FlashcardProposalViewModel[]) => void;
}

interface ErrorNotificationProps {
  error: { type: string; message: string };
  onClose: () => void;
}

// Mock fetch globally
vi.mock("global", async () => {
  const actual = await vi.importActual("global");
  return {
    ...actual,
    fetch: vi.fn(),
  };
});

// Mock the hook
vi.mock("./hooks/useGenerate", () => ({
  useGenerate: vi.fn(() => ({
    state: {
      stage: "input",
      error: undefined,
      proposals: undefined,
    },
    handleGenerate: vi.fn(),
    handleComplete: vi.fn(),
    handleGenerateNew: vi.fn(),
    handleViewAll: vi.fn(),
    clearError: vi.fn(),
  })),
}));

// Mock child components to focus on unit testing logic
vi.mock("./components/TextInputSection", () => ({
  TextInputSection: ({ onGenerate }: TextInputSectionProps) => (
    <button data-testid="generate-btn" onClick={() => onGenerate("Sample text")}>
      Generate
    </button>
  ),
}));

vi.mock("../../GenerationProgress", () => ({
  GenerationProgress: ({ status }: GenerationProgressProps) => <div data-testid="progress">{status}</div>,
}));

vi.mock("./components/FlashcardReviewSection", () => ({
  FlashcardReviewSection: ({ flashcards, onComplete }: FlashcardReviewSectionProps) => (
    <div data-testid="review-section">
      <span>{flashcards.length} flashcards</span>
      <button data-testid="complete-btn" onClick={() => onComplete(flashcards)}>
        Complete
      </button>
    </div>
  ),
}));

vi.mock("../../common/ErrorNotification", () => ({
  ErrorNotification: ({ error, onClose }: ErrorNotificationProps) => (
    <div data-testid="error-notification">
      {error.message}
      <button data-testid="close-error" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

describe("GenerateView", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial state and basic rendering", () => {
    it("should start in input stage", () => {
      vi.mocked(useGenerate).mockReturnValue({
        state: { stage: "input", error: undefined, proposals: undefined },
        handleGenerate: vi.fn(),
        handleComplete: vi.fn(),
        handleGenerateNew: vi.fn(),
        handleViewAll: vi.fn(),
        clearError: vi.fn(),
      });

      render(<GenerateView />);
      expect(screen.getByTestId("generate-btn")).toBeInTheDocument();
    });
  });

  describe("Generation workflow", () => {
    it("should show progress during generation", () => {
      vi.mocked(useGenerate).mockReturnValue({
        state: { stage: "generating", error: undefined, proposals: undefined },
        handleGenerate: vi.fn(),
        handleComplete: vi.fn(),
        handleGenerateNew: vi.fn(),
        handleViewAll: vi.fn(),
        clearError: vi.fn(),
      });

      render(<GenerateView />);
      expect(screen.getByTestId("progress")).toBeInTheDocument();
    });

    it("should show review section after generation", () => {
      const mockProposals = {
        proposals: [
          { id: "1", front: "Front 1", back: "Back 1", status: "pending" as const, isEdited: false },
          { id: "2", front: "Front 2", back: "Back 2", status: "pending" as const, isEdited: false },
        ],
        stats: {
          total: 2,
          accepted: 0,
          rejected: 0,
          edited: 0,
        },
      };

      vi.mocked(useGenerate).mockReturnValue({
        state: { stage: "review", error: undefined, proposals: mockProposals },
        handleGenerate: vi.fn(),
        handleComplete: vi.fn(),
        handleGenerateNew: vi.fn(),
        handleViewAll: vi.fn(),
        clearError: vi.fn(),
      });

      render(<GenerateView />);
      expect(screen.getByTestId("review-section")).toBeInTheDocument();
      expect(screen.getByText("2 flashcards")).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("should display error notification when error occurs", () => {
      vi.mocked(useGenerate).mockReturnValue({
        state: { stage: "input", error: "Test error message", proposals: undefined },
        handleGenerate: vi.fn(),
        handleComplete: vi.fn(),
        handleGenerateNew: vi.fn(),
        handleViewAll: vi.fn(),
        clearError: vi.fn(),
      });

      render(<GenerateView />);
      expect(screen.getByTestId("error-notification")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("should clear error when close button is clicked", () => {
      const mockClearError = vi.fn();
      vi.mocked(useGenerate).mockReturnValue({
        state: { stage: "input", error: "Test error message", proposals: undefined },
        handleGenerate: vi.fn(),
        handleComplete: vi.fn(),
        handleGenerateNew: vi.fn(),
        handleViewAll: vi.fn(),
        clearError: mockClearError,
      });

      render(<GenerateView />);
      fireEvent.click(screen.getByTestId("close-error"));
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe("User interactions", () => {
    it("should call handleGenerate when generate button is clicked", () => {
      const mockHandleGenerate = vi.fn();
      vi.mocked(useGenerate).mockReturnValue({
        state: { stage: "input", error: undefined, proposals: undefined },
        handleGenerate: mockHandleGenerate,
        handleComplete: vi.fn(),
        handleGenerateNew: vi.fn(),
        handleViewAll: vi.fn(),
        clearError: vi.fn(),
      });

      render(<GenerateView />);
      fireEvent.click(screen.getByTestId("generate-btn"));
      expect(mockHandleGenerate).toHaveBeenCalledWith("Sample text");
    });

    it("should call handleComplete when complete button is clicked", () => {
      const mockHandleComplete = vi.fn();
      const mockProposals = {
        proposals: [{ id: "1", front: "Front 1", back: "Back 1", status: "pending" as const, isEdited: false }],
        stats: {
          total: 1,
          accepted: 0,
          rejected: 0,
          edited: 0,
        },
      };

      vi.mocked(useGenerate).mockReturnValue({
        state: { stage: "review", error: undefined, proposals: mockProposals },
        handleGenerate: vi.fn(),
        handleComplete: mockHandleComplete,
        handleGenerateNew: vi.fn(),
        handleViewAll: vi.fn(),
        clearError: vi.fn(),
      });

      render(<GenerateView />);
      fireEvent.click(screen.getByTestId("complete-btn"));
      expect(mockHandleComplete).toHaveBeenCalledWith(mockProposals.proposals);
    });
  });
});
