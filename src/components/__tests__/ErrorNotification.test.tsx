import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorNotification } from "../ErrorNotification";
import type { ErrorState } from "../../types";

describe("ErrorNotification", () => {
  // Test configuration
  const DEFAULT_AUTO_HIDE_DURATION = 1000;
  const TIMING_TOLERANCE = 100;

  // Setup user-event
  const user = userEvent.setup();

  // Common props
  const mockOnClose = vi.fn();
  const defaultError: ErrorState = {
    type: "validation",
    message: "Test error message",
  };

  beforeEach(() => {
    // Reset timers and mocks before each test
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.clearAllTimers();
    vi.useRealTimers();
    mockOnClose.mockClear();
  });

  it("renders error message and title correctly", () => {
    render(<ErrorNotification error={defaultError} onClose={mockOnClose} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Validation Error")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it.each([
    ["validation", "Validation Error"],
    ["api", "API Error"],
    ["network", "Network Error"],
    ["generation", "Generation Error"],
    ["other" as const, "Error"],
  ])("displays correct title for %s error type", (type, expectedTitle) => {
    render(
      <ErrorNotification error={{ type: type as ErrorState["type"], message: "Test message" }} onClose={mockOnClose} />
    );

    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it("auto-hides after specified duration with tolerance", async () => {
    render(
      <ErrorNotification error={defaultError} onClose={mockOnClose} autoHideDuration={DEFAULT_AUTO_HIDE_DURATION} />
    );

    await vi.advanceTimersByTimeAsync(DEFAULT_AUTO_HIDE_DURATION - TIMING_TOLERANCE);
    expect(mockOnClose).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(TIMING_TOLERANCE * 2);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not auto-hide when autoHideDuration is false", () => {
    render(<ErrorNotification error={defaultError} onClose={mockOnClose} autoHideDuration={false} />);

    // Advance significant amount of time to ensure no auto-hide
    vi.advanceTimersByTime(DEFAULT_AUTO_HIDE_DURATION * 5);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("pauses auto-hide on hover and resumes on hover out", async () => {
    render(
      <ErrorNotification error={defaultError} onClose={mockOnClose} autoHideDuration={DEFAULT_AUTO_HIDE_DURATION} />
    );

    const alert = screen.getByRole("alert");

    // Hover over notification
    await user.hover(alert);
    await vi.advanceTimersByTimeAsync(DEFAULT_AUTO_HIDE_DURATION * 2);
    expect(mockOnClose).not.toHaveBeenCalled();

    // Hover out
    await user.unhover(alert);
    await vi.advanceTimersByTimeAsync(DEFAULT_AUTO_HIDE_DURATION);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("handles multiple rapid hover/unhover events correctly", async () => {
    render(
      <ErrorNotification error={defaultError} onClose={mockOnClose} autoHideDuration={DEFAULT_AUTO_HIDE_DURATION} />
    );
    const alert = screen.getByRole("alert");

    // Simulate rapid user interactions
    for (let i = 0; i < 3; i++) {
      await user.hover(alert);
      await vi.advanceTimersByTimeAsync(20);
      await user.unhover(alert);
      await vi.advanceTimersByTimeAsync(20);
    }

    // Verify notification wasn't closed during interactions
    expect(mockOnClose).not.toHaveBeenCalled();

    // Verify notification closes after interactions end
    await vi.advanceTimersByTimeAsync(DEFAULT_AUTO_HIDE_DURATION);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("closes on button click", async () => {
    render(<ErrorNotification error={defaultError} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close error notification/i });
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows action button when provided", async () => {
    const actionHandler = vi.fn();
    const errorWithAction: ErrorState = {
      ...defaultError,
      action: {
        label: "Retry",
        handler: actionHandler,
      },
    };

    render(<ErrorNotification error={errorWithAction} onClose={mockOnClose} />);

    const actionButton = screen.getByRole("button", { name: "Retry" });
    await user.click(actionButton);
    expect(actionHandler).toHaveBeenCalledTimes(1);
  });

  it("shows progress bar when enabled", () => {
    render(
      <ErrorNotification error={defaultError} onClose={mockOnClose} showProgressBar={true} autoHideDuration={5000} />
    );

    expect(screen.getByTestId("error-progress-bar")).toBeInTheDocument();
  });

  it("hides progress bar when hovered", async () => {
    render(
      <ErrorNotification
        error={defaultError}
        onClose={mockOnClose}
        showProgressBar={true}
        autoHideDuration={DEFAULT_AUTO_HIDE_DURATION}
      />
    );

    const alert = screen.getByRole("alert");

    // Verify initial state - progress bar should be present
    expect(screen.queryByTestId("error-progress-bar")).toBeInTheDocument();

    // On hover - progress bar should be removed
    await user.hover(alert);
    expect(screen.queryByTestId("error-progress-bar")).not.toBeInTheDocument();

    // After hover out - progress bar should be present again
    await user.unhover(alert);
    await vi.advanceTimersByTimeAsync(100); // Give time for state to update
    expect(screen.queryByTestId("error-progress-bar")).toBeInTheDocument();
  });

  it("applies animation class when enabled", () => {
    render(<ErrorNotification error={defaultError} onClose={mockOnClose} enableAnimation={true} />);

    expect(screen.getByRole("alert")).toHaveClass("animate-fadeIn");
  });

  it("is keyboard accessible", async () => {
    render(<ErrorNotification error={defaultError} onClose={mockOnClose} />);

    await user.tab();
    expect(screen.getByRole("button", { name: /close/i })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("applies custom className when provided", () => {
    render(<ErrorNotification error={defaultError} onClose={mockOnClose} className="custom-class" />);

    expect(screen.getByRole("alert")).toHaveClass("custom-class");
  });

  it("uses correct ARIA attributes for accessibility", () => {
    render(<ErrorNotification error={defaultError} onClose={mockOnClose} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });

  it("sanitizes HTML content in error messages", () => {
    const messageWithHTML = "<script>alert('xss')</script>Test message";
    render(<ErrorNotification error={{ ...defaultError, message: messageWithHTML }} onClose={mockOnClose} />);

    const alert = screen.getByRole("alert");
    expect(alert.innerHTML).not.toContain("<script>");
    expect(alert.textContent).toContain("Test message");
  });
});
