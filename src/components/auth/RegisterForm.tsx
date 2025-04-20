import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorNotification } from "../ErrorNotification";

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error?: string;
  success?: string;
}

export function RegisterForm() {
  const [state, setState] = useState<RegisterFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    isLoading: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isLoading: true, error: undefined, success: undefined }));

    try {
      // Form validation
      if (!state.email || !state.password || !state.confirmPassword) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Please fill in all fields",
        }));
        return;
      }

      if (state.password !== state.confirmPassword) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Passwords do not match",
        }));
        return;
      }

      if (state.password.length < 8) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Password must be at least 8 characters long",
        }));
        return;
      }

      const payload = {
        email: state.email.trim(),
        password: state.password,
      };

      console.log("Sending registration request:", { email: payload.email }); // Log without password

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      if (data.message) {
        // Show success message if email confirmation is required
        setState((prev) => ({
          ...prev,
          isLoading: false,
          success: data.message,
        }));
      } else {
        // Redirect to /generate if no email confirmation is required
        window.location.href = "/generate";
      }
    } catch (error) {
      console.error("Registration error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }));
    }
  };

  return (
    <div className="space-y-6">
      {state.error && (
        <ErrorNotification
          error={{ type: "validation", message: state.error }}
          onClose={() => setState((prev) => ({ ...prev, error: undefined }))}
        />
      )}

      {state.success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md">
          <p>{state.success}</p>
        </div>
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Enter your details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={state.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setState((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
            disabled={state.isLoading}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={state.isLoading}>
          {state.isLoading ? "Creating account..." : "Create account"}
        </Button>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}
