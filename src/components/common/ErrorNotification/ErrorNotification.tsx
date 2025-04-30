import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ErrorNotificationProps } from "./types";
import { TEST_IDS } from "./constants";

export function ErrorNotification({
  error,
  onClose,
  autoHideDuration = 5000,
  className,
  enableAnimation = false,
  showProgressBar = false,
}: ErrorNotificationProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Auto-hide the notification after the specified duration
  React.useEffect(() => {
    if (autoHideDuration && !isHovered) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose, isHovered]);

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
    <Alert
      variant="destructive"
      className={`relative ${enableAnimation ? "animate-fadeIn" : ""} ${className ?? ""}`}
      data-testid={TEST_IDS.CONTAINER}
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <XCircle className="h-4 w-4" />
      <AlertTitle data-testid={TEST_IDS.MESSAGE}>{getErrorTitle()}</AlertTitle>
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
        data-testid={TEST_IDS.CLOSE}
      >
        <XCircle className="h-4 w-4" />
      </button>
      {showProgressBar && autoHideDuration && !isHovered && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-destructive-foreground/20 error-progress-bar"
          style={{ "--duration": `${autoHideDuration}ms` } as React.CSSProperties}
          data-testid="error-progress-bar"
        />
      )}
    </Alert>
  );
}
