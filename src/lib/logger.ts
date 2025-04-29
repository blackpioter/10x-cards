import { LoggingService } from "./logging.service";
import { LogLevel } from "./logging.types";

// Domyślna instancja loggera dla całej aplikacji
const defaultLogger = new LoggingService({
  serviceName: "10x-cards",
});

// Logger wrapper - zastępuje standardowe wywołania console
export const logger = {
  debug: (message: string, ...data: unknown[]) => {
    defaultLogger.debug(message, data.length ? data : undefined);
  },
  log: (message: string, ...data: unknown[]) => {
    defaultLogger.info(message, data.length ? data : undefined);
  },
  info: (message: string, ...data: unknown[]) => {
    defaultLogger.info(message, data.length ? data : undefined);
  },
  warn: (message: string, ...data: unknown[]) => {
    defaultLogger.warn(message, data.length ? data : undefined);
  },
  error: (message: string, ...data: unknown[]) => {
    defaultLogger.error(message, data.length ? data : undefined);
  },
};

// Funkcja tworząca instancję loggera dla konkretnego modułu/komponentu
export function createLogger(serviceName: string) {
  const moduleLogger = new LoggingService({ serviceName });

  return {
    debug: (message: string, ...data: unknown[]) => {
      moduleLogger.debug(message, data.length ? data : undefined);
    },
    log: (message: string, ...data: unknown[]) => {
      moduleLogger.info(message, data.length ? data : undefined);
    },
    info: (message: string, ...data: unknown[]) => {
      moduleLogger.info(message, data.length ? data : undefined);
    },
    warn: (message: string, ...data: unknown[]) => {
      moduleLogger.warn(message, data.length ? data : undefined);
    },
    error: (message: string, ...data: unknown[]) => {
      moduleLogger.error(message, data.length ? data : undefined);
    },
  };
}

// Możliwość eksportu konkretnej instancji serwisu logowania dla zaawansowanych przypadków
export { LoggingService, LogLevel };
