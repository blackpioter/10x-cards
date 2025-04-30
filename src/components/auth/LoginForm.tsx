import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorNotification } from "../common/ErrorNotification";
import type { ErrorState } from "../../types";
import { useFeatureFlag } from "../../lib/hooks/useFeatureFlag";

interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  error?: ErrorState;
}

export function LoginForm() {
  const [state, setState] = useState<LoginFormState>({
    email: "",
    password: "",
    isLoading: false,
  });
  const isRegisterEnabled = useFeatureFlag("registerEnabled");

  const isFormValid = state.email.trim() !== "" && state.password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Form validation
      if (!state.email || !state.password) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: { type: "validation", message: "Please fill in all fields" },
        }));
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to sign in");
      }

      // Redirect to /generate on successful login
      window.location.href = "/generate";
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: {
          type: error instanceof TypeError && error.message === "Failed to fetch" ? "network" : "api",
          message:
            error instanceof TypeError && error.message === "Failed to fetch"
              ? "Failed to sign in"
              : error instanceof Error
                ? error.message
                : "An unexpected error occurred",
        },
      }));
    }
  };

  return (
    <div className="space-y-6" data-testid="login-form-container">
      {state.error && (
        <ErrorNotification
          error={{ type: state.error.type, message: state.error.message }}
          onClose={() => setState((prev) => ({ ...prev, error: undefined }))}
          data-testid="login-error-notification"
        />
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="login-header">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to sign in</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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
            data-testid="login-email-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={state.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setState((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={state.isLoading}
            required
            data-testid="login-password-input"
          />
        </div>

        <div className="text-sm text-right">
          <a href="/forgot-password" className="text-primary hover:underline" data-testid="forgot-password-link">
            Forgot your password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={state.isLoading || !isFormValid}
          data-testid="login-submit-button"
        >
          {state.isLoading ? "Signing in..." : "Sign in"}
        </Button>

        {isRegisterEnabled && (
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-primary hover:underline" data-testid="register-link">
              Sign up
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
