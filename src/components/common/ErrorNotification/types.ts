import type { ErrorState } from "@/types";

export interface ErrorNotificationTestIds {
  CONTAINER: string;
  MESSAGE: string;
  CLOSE: string;
}

export interface ErrorNotificationProps {
  error: ErrorState;
  onClose: () => void;
  autoHideDuration?: number | false;
  className?: string;
  enableAnimation?: boolean;
  showProgressBar?: boolean;
}
