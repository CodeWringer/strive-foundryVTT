/**
 * Represents the base implementation of a logging strategy, which only defines the contract, 
 * but no concrete implementation. 
 */
export class BaseLoggingStrategy {
  /**
   * Writes the given message to the log, at the given log level. 
   * @param {LogLevels} level The logging level. 
   * @param {String} message A message to write to the log. 
   * @param {Any} context Optional. A context object to also write to the log. 
   */
  log(level, message, context) {
    /* Concrete logging implementation required in implementing types. */
  }

  /**
   * Writes the given message to the log, at verbose log level. 
   * @param {String} message A message to write to the log. 
   * @param {Any} context Optional. A context object to also write to the log. 
   */
  logVerbose(message, context) {
    this.log(LogLevels.VERBOSE, message, context);
  }

  /**
   * Writes the given message to the log, at debug log level. 
   * @param {String} message A message to write to the log. 
   * @param {Any} context Optional. A context object to also write to the log. 
   */
  logDebug(message, context) {
    this.log(LogLevels.DEBUG, message, context);
  }

  /**
   * Writes the given message to the log, at warn log level. 
   * @param {String} message A message to write to the log. 
   * @param {Any} context Optional. A context object to also write to the log. 
   */
  logWarn(message, context) {
    this.log(LogLevels.WARN, message, context);
  }

  /**
   * Writes the given message to the log, at error log level. 
   * @param {String} message A message to write to the log. 
   * @param {Any} context Optional. A context object to also write to the log. 
   */
  logError(message, context) {
    this.log(LogLevels.ERROR, message, context);
  }
}

/**
 * Enum of available log levels. 
 */
export const LogLevels = {
  VERBOSE = 0,
  DEBUG = 1,
  WARN = 2,
  ERROR = 3
}