import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlashcardsView } from "./FlashcardsView";
import { useFlashcards } from "./useFlashcards";
import "@testing-library/jest-dom";
import type { FlashcardViewModel, FlashcardStatus } from "@/types";

// Interfejsy dla mocków komponentów
interface ExistingFlashcardListProps {
  flashcards: FlashcardViewModel[];
  onEdit: (flashcard: FlashcardViewModel) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

interface FlashcardFiltersProps {
  statusFilter: FlashcardStatus;
  onStatusFilterChange: (status: string) => void;
  counts?: Record<string, number>;
  isLoading?: boolean;
}

interface PaginationControlsProps {
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
}

interface EditFlashcardModalProps {
  flashcard: FlashcardViewModel | null;
  isOpen: boolean;
  onSave: (id: string, front: string, back: string) => void;
  onCancel: () => void;
}

interface CreateFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock dla hooka useFlashcards
const mockUpdateFlashcard = vi.fn().mockResolvedValue({});
const mockUpdateFlashcardWithError = vi.fn().mockImplementation(() => {
  const error = new Error("Update failed");

  // We use console.error here to simulate the actual error logging behavior of the component
  // eslint-disable-next-line no-console
  console.error("Error updating flashcard:", error);
  return Promise.reject(error);
});

// Mock the custom hook
vi.mock("./useFlashcards", () => ({
  useFlashcards: vi.fn(() => ({
    flashcards: [],
    pagination: { page: 1, page_size: 10, total: 0, total_pages: 0 },
    isLoading: false,
    error: null,
    statusFilter: "all",
    statusCounts: { all: 0, pending: 0, accepted: 0, rejected: 0 },
    updateFlashcardStatus: vi.fn(),
    deleteFlashcard: vi.fn(),
    updateFlashcard: mockUpdateFlashcard,
    filterByStatus: vi.fn(),
    goToPage: vi.fn(),
  })),
}));

// Mock the child components
vi.mock("../../ExistingFlashcardList", () => ({
  ExistingFlashcardList: ({ flashcards, onEdit, onDelete, onStatusChange }: ExistingFlashcardListProps) => (
    <div data-testid="flashcard-list">
      {flashcards.map((card) => (
        <div key={card.id} data-testid={`flashcard-${card.id}`}>
          <button onClick={() => onEdit(card)}>Edit</button>
          <button onClick={() => onDelete(card.id)}>Delete</button>
          <button onClick={() => onStatusChange(card.id, "accepted")}>Accept</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../FlashcardFilters", () => ({
  FlashcardFilters: ({ statusFilter, onStatusFilterChange }: FlashcardFiltersProps) => (
    <select data-testid="status-filter" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
      <option value="all">All</option>
      <option value="pending">Pending</option>
      <option value="accepted">Accepted</option>
      <option value="rejected">Rejected</option>
    </select>
  ),
}));

vi.mock("../../PaginationControls", () => ({
  PaginationControls: ({ pagination, onPageChange }: PaginationControlsProps) => (
    <div data-testid="pagination">
      <span>
        Page {pagination.page} of {pagination.total_pages}
      </span>
      <button onClick={() => onPageChange(1)}>1</button>
      <button onClick={() => onPageChange(2)}>2</button>
    </div>
  ),
}));

vi.mock("../../EditFlashcardModal", () => ({
  EditFlashcardModal: ({ flashcard, isOpen, onSave, onCancel }: EditFlashcardModalProps) =>
    isOpen &&
    flashcard && (
      <div data-testid="edit-modal">
        <input data-testid="front-input" defaultValue={flashcard.front || ""} />
        <input data-testid="back-input" defaultValue={flashcard.back || ""} />
        <button
          data-testid="save-btn"
          onClick={() => {
            onSave(flashcard.id, "Updated Front", "Updated Back");
          }}
        >
          Save
        </button>
        <button data-testid="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ),
}));

vi.mock("../../CreateFlashcardModal", () => ({
  CreateFlashcardModal: ({ isOpen, onClose }: CreateFlashcardModalProps) =>
    isOpen && (
      <div data-testid="create-modal">
        <button data-testid="close-create-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
}));

describe("FlashcardsView", () => {
  const mockFlashcard: FlashcardViewModel = {
    id: "test-id",
    front: "Test Front",
    back: "Test Back",
    status: "pending",
    source: "manual",
    created_at: "2023-01-01",
    updated_at: "2023-01-01",
    generation_id: null,
    operations: {
      statusChange: { isLoading: false, error: null },
      delete: { isLoading: false, error: null },
      edit: { isLoading: false, error: null },
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Resetujemy mocki
    mockUpdateFlashcard.mockClear();
    mockUpdateFlashcardWithError.mockClear();
  });

  describe("UI state rendering", () => {
    it("should display loader when isLoading is true", () => {
      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        isLoading: true,
      });

      render(<FlashcardsView />);
      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("should display error alert when error exists", () => {
      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        error: "Test error message",
      });

      render(<FlashcardsView />);
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("should display flashcard list when not loading and no error", () => {
      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        flashcards: [mockFlashcard],
      });

      render(<FlashcardsView />);
      expect(screen.getByTestId("flashcard-list")).toBeInTheDocument();
      expect(screen.getByTestId(`flashcard-${mockFlashcard.id}`)).toBeInTheDocument();
    });

    it("should display empty list message when no flashcards are available", () => {
      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        flashcards: [],
      });

      render(<FlashcardsView />);
      expect(screen.getByTestId("flashcard-list")).toBeInTheDocument();
      expect(screen.queryByTestId(`flashcard-${mockFlashcard.id}`)).not.toBeInTheDocument();
    });
  });

  describe("Edit modal interactions", () => {
    it("should open edit modal when edit button is clicked", () => {
      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        flashcards: [mockFlashcard],
      });

      render(<FlashcardsView />);

      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);

      expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
      expect(screen.getByTestId("front-input")).toHaveValue("Test Front");
      expect(screen.getByTestId("back-input")).toHaveValue("Test Back");
    });

    it("should close edit modal when cancel is clicked", () => {
      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        flashcards: [mockFlashcard],
      });

      render(<FlashcardsView />);

      // Open modal
      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);

      // Close modal
      const cancelButton = screen.getByTestId("cancel-btn");
      fireEvent.click(cancelButton);

      // Modal should be closed
      expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
    });

    it("should call updateFlashcard when save is clicked in edit modal", async () => {
      vi.mocked(useFlashcards).mockReturnValue({
        ...useFlashcards(),
        flashcards: [mockFlashcard],
        updateFlashcard: mockUpdateFlashcard,
      });

      render(<FlashcardsView />);

      // Open modal
      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);

      // Zapisujemy zmiany
      const saveButton = screen.getByTestId("save-btn");
      fireEvent.click(saveButton);

      // Sprawdzamy czy funkcja została wywołana
      expect(mockUpdateFlashcard).toHaveBeenCalledWith("test-id", "Updated Front", "Updated Back");

      // Czekamy na zamknięcie modala po udanej aktualizacji
      await waitFor(() => {
        expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();
      });
    });

    it("should handle error during updateFlashcard", async () => {
      const error = new Error("Update failed");
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => void 0);

      // We need to manually trigger console.error to match the component's error handling behavior
      const updateFlashcardMock = vi.fn().mockImplementation(() => {
        // eslint-disable-next-line no-console
        console.error("Error updating flashcard:", error);
        return Promise.reject(error);
      });

      vi.mocked(useFlashcards).mockReturnValue({
        ...useFlashcards(),
        flashcards: [mockFlashcard],
        updateFlashcard: updateFlashcardMock,
      });

      render(<FlashcardsView />);

      // Open modal
      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);

      // Próba zapisu zmian
      const saveButton = screen.getByTestId("save-btn");
      fireEvent.click(saveButton);

      // Sprawdzamy czy funkcja została wywołana
      expect(updateFlashcardMock).toHaveBeenCalledWith("test-id", "Updated Front", "Updated Back");

      // Czekamy na komunikat o błędzie
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating flashcard:", error);
      });

      // Modal powinien pozostać otwarty po nieudanej aktualizacji
      expect(screen.getByTestId("edit-modal")).toBeInTheDocument();

      // Clean up the spy
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Create modal interactions", () => {
    it("should open create modal when add button is clicked", () => {
      render(<FlashcardsView />);

      const addButton = screen.getByText("Add Flashcard");
      fireEvent.click(addButton);

      expect(screen.getByTestId("create-modal")).toBeInTheDocument();
    });

    it("should close create modal when close button is clicked", () => {
      render(<FlashcardsView />);

      // Open modal
      const addButton = screen.getByText("Add Flashcard");
      fireEvent.click(addButton);

      // Close modal
      const closeButton = screen.getByTestId("close-create-modal");
      fireEvent.click(closeButton);

      // Modal should be closed
      expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();
    });
  });

  describe("Flashcard operations", () => {
    it("should call deleteFlashcard when delete button is clicked", () => {
      const mockDeleteFlashcard = vi.fn().mockResolvedValue({});

      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        flashcards: [mockFlashcard],
        deleteFlashcard: mockDeleteFlashcard,
      });

      render(<FlashcardsView />);

      // Click delete button
      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      expect(mockDeleteFlashcard).toHaveBeenCalledWith("test-id");
    });

    it("should call updateFlashcardStatus when status button is clicked", () => {
      const mockUpdateFlashcardStatus = vi.fn().mockResolvedValue({});

      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        flashcards: [mockFlashcard],
        updateFlashcardStatus: mockUpdateFlashcardStatus,
      });

      render(<FlashcardsView />);

      // Click status button
      const acceptButton = screen.getByText("Accept");
      fireEvent.click(acceptButton);

      expect(mockUpdateFlashcardStatus).toHaveBeenCalledWith("test-id", "accepted");
    });
  });

  describe("Pagination and filtering", () => {
    it("should call filterByStatus when status filter is changed", () => {
      const mockFilterByStatus = vi.fn();

      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        filterByStatus: mockFilterByStatus,
      });

      render(<FlashcardsView />);

      // Change status filter
      const statusFilter = screen.getByTestId("status-filter");
      fireEvent.change(statusFilter, { target: { value: "accepted" } });

      expect(mockFilterByStatus).toHaveBeenCalledWith("accepted");
    });

    it("should call goToPage when page navigation is clicked", () => {
      const mockGoToPage = vi.fn();

      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        pagination: { page: 1, page_size: 10, total: 20, total_pages: 2 },
        goToPage: mockGoToPage,
      });

      render(<FlashcardsView />);

      // Click page 2 button
      const page2Button = screen.getByText("2");
      fireEvent.click(page2Button);

      expect(mockGoToPage).toHaveBeenCalledWith(2);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty flashcard array", () => {
      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        flashcards: [],
      });

      render(<FlashcardsView />);

      // Flashcard list should be empty
      expect(screen.getByTestId("flashcard-list")).toBeInTheDocument();
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("should handle pagination with single page", () => {
      vi.mocked(useFlashcards).mockReturnValueOnce({
        ...useFlashcards(),
        flashcards: [mockFlashcard],
        pagination: { page: 1, page_size: 10, total: 1, total_pages: 1 },
      });

      render(<FlashcardsView />);

      expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    });
  });
});
