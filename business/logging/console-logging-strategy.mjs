import { BaseLoggingStrategy, LogLevels } from "./base-logging-strategy.mjs";

export class ConsoleLoggingStrategy extends BaseLoggingStrategy {
  constructor(logLevel = LogLevels.VERBOSE) {
    super(logLevel);
  }

  /**
   * Writes the given message to the log, at the given log level. 
   * @param {LogLevels} level The logging level. 
   * @param {String} message A message to write to the log. 
   */
  log(level, message) {
    if (this.logLevel >= LogLevels.VERBOSE && level == LogLevels.VERBOSE) {
      console.log(message);
    } else if (this.logLevel >= LogLevels.DEBUG && level == LogLevels.DEBUG) {
      console.log(message);
    } else if (this.logLevel >= LogLevels.WARN && level == LogLevels.WARN) {
      console.warn(message);
    } else if (this.logLevel >= LogLevels.ERROR && level == LogLevels.ERROR) {
      console.error(message);
    }
  }
}