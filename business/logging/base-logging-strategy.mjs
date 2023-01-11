/**
 * Represents the base implementation of a logging strategy, which only defines the contract, 
 * but no concrete implementation. 
 */
export class BaseLoggingStrategy {
  /**
   * The current log level. Only messages that are at least this specific will be written to the log. 
   * @type {LogLevels}
   */
  logLevel = LogLevels.VERBOSE;

  constructor(logLevel = LogLevels.VERBOSE) {
    this.logLevel = logLevel;
  }
  
  /**
   * Writes the given message to the log, at the given log level. 
   * @param {LogLevels} level The logging level. 
   * @param {String} message A message to write to the log. 
   */
  log(level, message) {
    // Concrete logging implementation required in implementing types.
  }

  /**
   * Writes the given message to the log, at verbose log level. 
   * @param {String} message A message to write to the log. 
   */
  logVerbose(message) {
    this.log(LogLevels.VERBOSE, `[VERBOSE] ${message}`);
  }

  /**
   * Writes the given message to the log, at debug log level. 
   * @param {String} message A message to write to the log. 
   */
  logDebug(message) {
    this.log(LogLevels.DEBUG, `[DEBUG] ${message}`);
  }

  /**
   * Writes the given message to the log, at warn log level. 
   * @param {String} message A message to write to the log. 
   */
  logWarn(message) {
    this.log(LogLevels.WARN, `[WARN] ${message}`);
  }

  /**
   * Writes the given message to the log, at error log level. 
   * @param {Error | String} error An error (message) to write to the log. 
   */
  logError(error) {
    this.log(LogLevels.ERROR, `[ERROR] ${error.message ?? error}`);
  }

  /**
   * Executes and then logs the time taken for the given `functionBlock`. 
   * 
   * Outputs a `LogLevels.VERBOSE` level message. 
   * 
   * @param {Object} obj The context to bind the `functionBlock` to. 
   * @param {String | undefined} msg A message to output along with the time taken. 
   * @param {Function} functionBlock The function block to execute. 
   */
  logPerf(obj, msg, functionBlock) {
    functionBlock.bind(obj);
    const perf0 = performance.now();
    functionBlock();
    const perf1 = performance.now();
    this.logVerbose(`Perf: ${msg} took: ${perf1 - perf0} milliseconds`);
  }
}

/**
 * Enum of available log levels. 
 * 
 * @property {Number} ERROR 
 * @property {Number} WARN 
 * @property {Number} DEBUG 
 * @property {Number} VERBOSE 
 * 
 * @constant
 */
export const LogLevels = {
  ERROR: 0,
  WARN: 1,
  DEBUG: 2,
  VERBOSE: 3
}