// Log levels enum
export const enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

// Get log level from environment variable, default to INFO if not set
export const LOG_LEVEL = (import.meta.env.LOG_LEVEL || LogLevel.INFO).toLowerCase() as LogLevel;

// Log level hierarchy for filtering
export const LOG_LEVEL_HIERARCHY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};
