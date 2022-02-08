import { BaseLoggingStrategy, LogLevels } from "./base-logging-strategy.mjs";

export class ConsoleLoggingStrategy extends BaseLoggingStrategy {
  /**
   * Writes the given message to the log, at the given log level. 
   * @param {LogLevels} level The logging level. 
   * @param {String} message A message to write to the log. 
   * @param {Any} context Optional. A context object to also write to the log. 
   */
  log(level, message, context = undefined) {
    switch (level) {
      case LogLevels.VERBOSE:
      case LogLevels.DEBUG:
        console.log(message);
        if (context !== undefined) {
          console.log(context);
        }
        break;
      case LogLevels.WARN:
        console.warn(message);
        if (context !== undefined) {
          console.warn(context);
        }
        break;
      case LogLevels.ERROR:
        console.error(message);
        if (context !== undefined) {
          console.error(context);
        }
        break;
      default:
        throw new Error(`Invalid log level '${level}'`);
    }
  }
}