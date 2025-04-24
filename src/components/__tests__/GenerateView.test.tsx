import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GenerateView } from "../GenerateView";
import "@testing-library/jest-dom";
import type { FlashcardProposalViewModel } from "../../types";

// Typ dla mocka fetch
interface MockFetch {
  (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>;
  mockResolvedValueOnce: (value: Partial<Response>) => void;
  mockRejectedValueOnce: (reason: Error) => void;
  mockReset: () => void;
}

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

// Mock child components to focus on unit testing logic
vi.mock("../TextInputSection", () => ({
  TextInputSection: ({ onGenerate }: TextInputSectionProps) => (
    <button data-testid="generate-btn" onClick={() => onGenerate("Sample text")}>
      Generate
    </button>
  ),
}));

vi.mock("../GenerationProgress", () => ({
  GenerationProgress: ({ status }: GenerationProgressProps) => <div data-testid="progress">{status}</div>,
}));

// Używamy funkcji dla mocka, żeby móc kontrolować zachowanie w testach
let mockCompleteCallback: ((flashcards: FlashcardProposalViewModel[]) => void) | null = null;

vi.mock("../FlashcardReviewSection", () => ({
  FlashcardReviewSection: ({ flashcards, onComplete }: FlashcardReviewSectionProps) => {
    // Zapisujemy referencję do funkcji, aby móc je kontrolować w testach
    mockCompleteCallback = onComplete;

    return (
      <div data-testid="review-section">
        <span>{flashcards.length} flashcards</span>
        <button data-testid="complete-btn" onClick={() => onComplete(flashcards)}>
          Complete
        </button>
      </div>
    );
  },
}));

vi.mock("../ErrorNotification", () => ({
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
    global.fetch = vi.fn() as unknown as MockFetch;
    // Resetujemy też zmienne pomocnicze
    mockCompleteCallback = null;
  });

  describe("Initial state and basic rendering", () => {
    it("should start in input stage", () => {
      render(<GenerateView />);
      expect(screen.getByTestId("generate-btn")).toBeInTheDocument();
    });
  });

  describe("Generation workflow", () => {
    it("should transition to generating stage when handleGenerate is called", async () => {
      render(<GenerateView />);

      // Mock successful API response
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            generation_id: "test-id",
            flashcard_proposals: [{ id: "1", front: "Front 1", back: "Back 1" }],
          }),
      });

      fireEvent.click(screen.getByTestId("generate-btn"));

      // Should be in generating stage
      await waitFor(() => {
        expect(screen.getByTestId("progress")).toBeInTheDocument();
      });
    });

    it("should transition to review stage after successful generation", async () => {
      render(<GenerateView />);

      // Mock successful API response
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            generation_id: "test-id",
            flashcard_proposals: [
              { id: "1", front: "Front 1", back: "Back 1" },
              { id: "2", front: "Front 2", back: "Back 2" },
            ],
          }),
      });

      fireEvent.click(screen.getByTestId("generate-btn"));

      // Should transition to review stage
      await waitFor(() => {
        expect(screen.getByTestId("review-section")).toBeInTheDocument();
        expect(screen.getByText("2 flashcards")).toBeInTheDocument();
      });
    });
  });

  describe("Error handling", () => {
    it("should handle API error during generation", async () => {
      render(<GenerateView />);

      // Mock API error
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error",
      });

      fireEvent.click(screen.getByTestId("generate-btn"));

      // Should show error notification and return to input stage
      await waitFor(() => {
        expect(screen.getByTestId("error-notification")).toBeInTheDocument();
        expect(screen.getByTestId("generate-btn")).toBeInTheDocument();
      });
    });

    it("should handle API error with specific HTTP status codes", async () => {
      render(<GenerateView />);

      // Mock different API errors
      const errorCases = [
        { status: 400, statusText: "Bad Request" },
        { status: 401, statusText: "Unauthorized" },
        { status: 429, statusText: "Too Many Requests" },
      ];

      for (const errorCase of errorCases) {
        (global.fetch as MockFetch).mockReset();
        (global.fetch as MockFetch).mockResolvedValueOnce({
          ok: false,
          status: errorCase.status,
          statusText: errorCase.statusText,
        });

        fireEvent.click(screen.getByTestId("generate-btn"));

        // Should show error notification and return to input stage
        await waitFor(() => {
          expect(screen.getByTestId("error-notification")).toBeInTheDocument();
        });

        // Clear error to continue with next test case
        fireEvent.click(screen.getByTestId("close-error"));
      }
    });

    it("should handle network errors during generation", async () => {
      render(<GenerateView />);

      // Mock network error
      (global.fetch as MockFetch).mockRejectedValueOnce(new Error("Network error"));

      fireEvent.click(screen.getByTestId("generate-btn"));

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByTestId("error-notification")).toBeInTheDocument();
      });
    });
  });

  describe("Flashcard status updates", () => {
    it("should send flashcard status updates when complete is clicked", async () => {
      // Renderujemy komponent
      render(<GenerateView />);

      // Mock successful API response for generację flashcards
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            generation_id: "test-id",
            flashcard_proposals: [
              { id: "1", front: "Front 1", back: "Back 1" },
              { id: "2", front: "Front 2", back: "Back 2" },
            ],
          }),
      });

      // Wywołujemy generację
      fireEvent.click(screen.getByTestId("generate-btn"));

      // Sprawdzamy czy wyświetlił się review section
      await waitFor(() => {
        expect(screen.getByTestId("review-section")).toBeInTheDocument();
      });

      // Mockujemy API dla zapisu statusów, ale dodajemy błąd
      (global.fetch as MockFetch).mockReset();
      // Poniższy fetch będzie wywoływany przez handleComplete i powinien zwrócić błąd
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error",
      });

      // Modyfikujemy ręcznie flashcards nadając im statusy (symulowanie akcji użytkownika)
      const updatedFlashcards: FlashcardProposalViewModel[] = [
        { id: "1", front: "Front 1", back: "Back 1", status: "accepted", isEdited: false },
        { id: "2", front: "Front 2", back: "Back 2", status: "rejected", isEdited: false },
      ];

      // Wywołujemy funkcję complete z ręcznie zaktualizowanymi flashcards
      if (mockCompleteCallback) {
        mockCompleteCallback(updatedFlashcards);
      }

      // Sprawdzamy czy API zostało wywołane
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1); // 1 dla generacji
      });

      // Sprawdzamy czy pojawił się komunikat o błędzie
      expect(screen.getByTestId("error-notification")).toBeInTheDocument();

      // Zamykamy komunikat o błędzie
      fireEvent.click(screen.getByTestId("close-error"));

      // Powinniśmy nadal być w trybie review po zamknięciu błędu
      expect(screen.getByTestId("review-section")).toBeInTheDocument();
    });

    it("should handle API error during status updates", async () => {
      render(<GenerateView />);

      // Setup initial state with flashcards already generated
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            generation_id: "test-id",
            flashcard_proposals: [{ id: "1", front: "Front 1", back: "Back 1" }],
          }),
      });

      // Mock failed status update
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error",
      });

      fireEvent.click(screen.getByTestId("generate-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("review-section")).toBeInTheDocument();
      });

      // Klikamy przycisk complete
      fireEvent.click(screen.getByTestId("complete-btn"));

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByTestId("error-notification")).toBeInTheDocument();
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle empty list of flashcard proposals", async () => {
      render(<GenerateView />);

      // Mock API response with empty flashcard list
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            generation_id: "test-id",
            flashcard_proposals: [],
          }),
      });

      fireEvent.click(screen.getByTestId("generate-btn"));

      // Should transition to review stage with 0 flashcards
      await waitFor(() => {
        expect(screen.getByTestId("review-section")).toBeInTheDocument();
        expect(screen.getByText("0 flashcards")).toBeInTheDocument();
      });
    });

    it("should handle missing generation ID in API response", async () => {
      render(<GenerateView />);

      // Mock API response with missing generation ID
      (global.fetch as MockFetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            flashcard_proposals: [{ id: "1", front: "Front 1", back: "Back 1" }],
          }),
      });

      fireEvent.click(screen.getByTestId("generate-btn"));

      // Should still transition to review stage but show error when completing
      await waitFor(() => {
        expect(screen.getByTestId("review-section")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("complete-btn"));

      // Should show error notification because generation ID is missing
      await waitFor(() => {
        expect(screen.getByTestId("error-notification")).toBeInTheDocument();
      });
    });
  });
});
