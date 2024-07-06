/**
 * Represents a logging service that provides methods for logging different types of messages.
 */
export interface ILogService {
  /**
   * Logs an informational message.
   * @param message - The message to be logged.
   * @param args - Additional arguments to be included in the log message.
   */
  info(message: string, ...args: any[]): void;

  /**
   * Logs a warning message.
   * @param message - The message to be logged.
   * @param args - Additional arguments to be included in the log message.
   */
  warn(message: string, ...args: any[]): void;

  /**
   * Logs an error message.
   * @param message - The message to be logged.
   * @param args - Additional arguments to be included in the log message.
   */
  error(message: string, ...args: any[]): void;

  /**
   * Logs a debug message.
   * @param message - The message to be logged.
   * @param args - Additional arguments to be included in the log message.
   */
  debug(message: string, ...args: any[]): void;
}
