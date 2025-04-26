import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ErrorState } from "../types";

interface ErrorNotificationProps {
  error: ErrorState;
  onClose: () => void;
  autoHideDuration?: number;
}

export function ErrorNotification({ error, onClose, autoHideDuration = 5000 }: ErrorNotificationProps) {
  // Auto-hide the notification after the specified duration
  React.useEffect(() => {
    if (autoHideDuration) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);

  const getErrorTitle = () => {
    switch (error.type) {
      case "validation":
        return "Validation Error";
      case "api":
        return "API Error";
      case "network":
        return "Network Error";
      case "generation":
        return "Generation Error";
      default:
        return "Error";
    }
  };

  return (
    <Alert variant="destructive" className="relative">
      <XCircle className="h-4 w-4" />
      <AlertTitle>{getErrorTitle()}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      {error.action && (
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={error.action.handler}>
            {error.action.label}
          </Button>
        </div>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-destructive-foreground/70 hover:text-destructive-foreground"
        aria-label="Close error notification"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </Alert>
  );
}
