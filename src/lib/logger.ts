import { LoggingService } from "./logging.service";
import { LogLevel } from "./logging.types";

// Funkcja pomocnicza do połączenia wielu argumentów w jeden obiekt
function mergeArgs(message: string, args: unknown[]): { message: string; data?: unknown } {
  if (args.length === 0) {
    return { message };
  }

  if (args.length === 1) {
    return { message, data: args[0] };
  }

  // Dla wielu argumentów, tworzymy obiekt z numerowanymi kluczami
  const data = { _args: args };
  return { message, data };
}

// Domyślna instancja loggera dla całej aplikacji
const defaultLogger = new LoggingService({
  serviceName: "10x-cards",
});

// Logger wrapper - zastępuje standardowe wywołania console
export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    const { message: msg, data } = mergeArgs(message, args);
    defaultLogger.debug(msg, data);
  },
  log: (message: string, ...args: unknown[]) => {
    const { message: msg, data } = mergeArgs(message, args);
    defaultLogger.info(msg, data);
  },
  info: (message: string, ...args: unknown[]) => {
    const { message: msg, data } = mergeArgs(message, args);
    defaultLogger.info(msg, data);
  },
  warn: (message: string, ...args: unknown[]) => {
    const { message: msg, data } = mergeArgs(message, args);
    defaultLogger.warn(msg, data);
  },
  error: (message: string, ...args: unknown[]) => {
    const { message: msg, data } = mergeArgs(message, args);
    defaultLogger.error(msg, data);
  },
  // Dodajemy metody sanityzacyjne z LoggingService
  sanitizeData: (data: unknown) => {
    return defaultLogger.sanitizeData(data);
  },
  sanitizeHeaders: (headers: Headers | Record<string, string>) => {
    return defaultLogger.sanitizeHeaders(headers);
  },
};

// Funkcja tworząca instancję loggera dla konkretnego modułu/komponentu
export function createLogger(serviceName: string) {
  const moduleLogger = new LoggingService({ serviceName });

  return {
    debug: (message: string, ...args: unknown[]) => {
      const { message: msg, data } = mergeArgs(message, args);
      moduleLogger.debug(msg, data);
    },
    log: (message: string, ...args: unknown[]) => {
      const { message: msg, data } = mergeArgs(message, args);
      moduleLogger.info(msg, data);
    },
    info: (message: string, ...args: unknown[]) => {
      const { message: msg, data } = mergeArgs(message, args);
      moduleLogger.info(msg, data);
    },
    warn: (message: string, ...args: unknown[]) => {
      const { message: msg, data } = mergeArgs(message, args);
      moduleLogger.warn(msg, data);
    },
    error: (message: string, ...args: unknown[]) => {
      const { message: msg, data } = mergeArgs(message, args);
      moduleLogger.error(msg, data);
    },
    // Dodajemy metody sanityzacyjne z LoggingService
    sanitizeData: (data: unknown) => {
      return moduleLogger.sanitizeData(data);
    },
    sanitizeHeaders: (headers: Headers | Record<string, string>) => {
      return moduleLogger.sanitizeHeaders(headers);
    },
  };
}

// Możliwość eksportu konkretnej instancji serwisu logowania dla zaawansowanych przypadków
export { LoggingService, LogLevel };
