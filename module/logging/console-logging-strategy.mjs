import { BaseLoggingStrategy, LogLevels } from "./base-logging-strategy.mjs";

export class ConsoleLoggingStrategy extends BaseLoggingStrategy {
  constructor(logLevel = LogLevels.VERBOSE) {
    super(logLevel);
  }

  /**
   * Writes the given message to the log, at the given log level. 
   * @param {LogLevels} level The logging level. 
   * @param {String} message A message to write to the log. 
   * @param {Any} context Optional. A context object to also write to the log. 
   */
  log(level, message, context = undefined) {
    if (this.logLevel >= LogLevels.VERBOSE && level == LogLevels.VERBOSE) {
      this._log(message, context);
    } else if (this.logLevel >= LogLevels.DEBUG && level == LogLevels.DEBUG) {
      this._log(message, context);
    } else if (this.logLevel >= LogLevels.WARN && level == LogLevels.WARN) {
      this._warn(message, context);
    } else if (this.logLevel >= LogLevels.ERROR && level == LogLevels.ERROR) {
      this._error(message, context);
    }
  }

  /**
   * @param message 
   * @param context 
   * @private
   */
  _log(message, context) {
    console.log(message);
    if (context !== undefined) {
      console.log(context);
    }
  }

  /**
   * @param message 
   * @param context 
   * @private
   */
  _warn(message, context) {
    console.warn(message);
    if (context !== undefined) {
      console.warn(context);
    }
  }

  /**
   * @param message 
   * @param context 
   * @private
   */
  _error(message, context) {
    console.error(message);
    if (context !== undefined) {
      console.error(context);
    }
  }
}