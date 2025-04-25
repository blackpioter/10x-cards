import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorNotification } from "../ErrorNotification";

interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  error?: string;
}

export function LoginForm() {
  const [state, setState] = useState<LoginFormState>({
    email: "",
    password: "",
    isLoading: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Form validation
      if (!state.email || !state.password) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Please fill in all fields",
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
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }));
    }
  };

  return (
    <div className="space-y-6" data-test-id="login-form-container">
      {state.error && (
        <ErrorNotification
          data-test-id="login-error-message"
          error={{ type: "validation", message: state.error }}
          onClose={() => setState((prev) => ({ ...prev, error: undefined }))}
        />
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight" data-test-id="login-header">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground" data-test-id="login-subheader">
          Enter your credentials to sign in
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" data-test-id="login-form">
        <div className="space-y-2">
          <Label htmlFor="email" data-test-id="login-email-label">
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
            data-test-id="login-email-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" data-test-id="login-password-label">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={state.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setState((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={state.isLoading}
            required
            data-test-id="login-password-input"
          />
        </div>

        <div className="text-sm text-right">
          <a href="/forgot-password" className="text-primary hover:underline" data-test-id="login-forgot-password-link">
            Forgot your password?
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={state.isLoading} data-test-id="login-submit-button">
          {state.isLoading ? "Signing in..." : "Sign in"}
        </Button>

        <div className="text-center text-sm" data-test-id="login-register-section">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-primary hover:underline" data-test-id="login-register-link">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
