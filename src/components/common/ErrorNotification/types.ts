import type { ErrorState } from "@/types";

export interface ErrorNotificationProps {
  error: ErrorState;
  onClose: () => void;
  autoHideDuration?: number | false;
  "data-testid"?: string;
  className?: string;
  enableAnimation?: boolean;
  showProgressBar?: boolean;
}
