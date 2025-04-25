import { useEffect, useState } from "react";
import { ErrorNotification } from "../ErrorNotification";

interface LogoutMessageState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

export function LogoutMessage() {
  const [state, setState] = useState<LogoutMessageState>({
    isLoading: true,
  });

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Show success message immediately, then attempt logout
        setState((prev) => ({
          ...prev,
          isLoading: false,
          success: "Signing out...",
        }));

        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to logout");
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          success: data.message || "Successfully logged out",
        }));

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "An unexpected error occurred",
        }));
      }
    };

    performLogout();
  }, []);

  return (
    <div className="space-y-6" data-test-id="logout-container">
      {state.error && (
        <ErrorNotification
          data-test-id="logout-error"
          error={{ type: "validation", message: state.error }}
          onClose={() => setState((prev) => ({ ...prev, error: undefined }))}
        />
      )}

      {state.success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md" data-test-id="logout-success-message">
          <p>{state.success}</p>
          <p className="text-sm mt-2" data-test-id="logout-redirect-message">
            Redirecting to login page...
          </p>
        </div>
      )}

      {state.isLoading && (
        <div className="text-center" data-test-id="logout-loading">
          <p>Logging out...</p>
        </div>
      )}
    </div>
  );
}
