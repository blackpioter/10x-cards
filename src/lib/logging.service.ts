import { LogLevel, LOG_LEVEL, LOG_LEVEL_HIERARCHY } from "./logging.types";

export interface LoggerConfig {
  serviceName: string;
  logger?: Console;
}

export class LoggingService {
  private readonly _logger: Console;
  private readonly _serviceName: string;

  constructor(config: LoggerConfig) {
    this._logger = config.logger || console;
    this._serviceName = config.serviceName;
  }

  public log(level: LogLevel, message: string, data?: unknown): void {
    // Only log if the current level is higher or equal to the configured level
    if (LOG_LEVEL_HIERARCHY[level] < LOG_LEVEL_HIERARCHY[LOG_LEVEL]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      service: this._serviceName,
      message,
      ...(data ? { data } : {}),
    };

    switch (level) {
      case LogLevel.DEBUG:
        this._logger.debug(JSON.stringify(logData));
        break;
      case LogLevel.INFO:
        this._logger.info(JSON.stringify(logData));
        break;
      case LogLevel.WARN:
        this._logger.warn(JSON.stringify(logData));
        break;
      case LogLevel.ERROR:
        this._logger.error(JSON.stringify(logData));
        break;
    }
  }

  // Convenience methods
  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  public error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data);
  }
}
