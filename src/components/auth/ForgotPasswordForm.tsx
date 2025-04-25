import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorNotification } from "../ErrorNotification";

interface ForgotPasswordFormState {
  email: string;
  isLoading: boolean;
  error?: string;
  isSubmitted: boolean;
}

export function ForgotPasswordForm() {
  const [state, setState] = useState<ForgotPasswordFormState>({
    email: "",
    isLoading: false,
    isSubmitted: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    // Form validation
    if (!state.email) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Please enter your email address",
      }));
      return;
    }

    // Note: Actual password reset logic will be implemented later
    setState((prev) => ({
      ...prev,
      isLoading: false,
      isSubmitted: true,
    }));
  };

  if (state.isSubmitted) {
    return (
      <div className="space-y-6 text-center" data-test-id="forgot-password-success-container">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight" data-test-id="forgot-password-success-title">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground" data-test-id="forgot-password-success-message">
            We have sent a password reset link to your email address.
          </p>
        </div>
        <Button asChild className="w-full" data-test-id="forgot-password-back-to-login">
          <a href="/login">Back to login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-test-id="forgot-password-container">
      {state.error && (
        <ErrorNotification
          data-test-id="forgot-password-error"
          error={{ type: "validation", message: state.error }}
          onClose={() => setState((prev) => ({ ...prev, error: undefined }))}
        />
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight" data-test-id="forgot-password-header">
          Forgot password?
        </h1>
        <p className="text-sm text-muted-foreground" data-test-id="forgot-password-subheader">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" data-test-id="forgot-password-form">
        <div className="space-y-2">
          <Label htmlFor="email" data-test-id="forgot-password-email-label">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={state.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setState((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={state.isLoading}
            required
            data-test-id="forgot-password-email-input"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={state.isLoading}
          data-test-id="forgot-password-submit-button"
        >
          {state.isLoading ? "Sending reset link..." : "Send reset link"}
        </Button>

        <div className="text-center text-sm" data-test-id="forgot-password-login-section">
          Remember your password?{" "}
          <a href="/login" className="text-primary hover:underline" data-test-id="forgot-password-login-link">
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}
