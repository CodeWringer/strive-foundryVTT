import { LOG_LEVELS } from "./log-levels.mjs";

/**
 * Logger with adjustable log levels, which writes to the console. 
 */
export class ConsoleLogger {
/**
   * The current log level. Only messages that are at least this specific will be written to the log. 
   * @type {LOG_LEVELS}
   */
  logLevel = LOG_LEVELS.VERBOSE;

  constructor(logLevel = LOG_LEVELS.VERBOSE) {
    this.logLevel = logLevel;
  }
  
  /**
   * Writes the given message to the log, at the given log level. 
   * @param {LOG_LEVELS} level The logging level. 
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
    this.log(LOG_LEVELS.VERBOSE, `[VERBOSE] ${message}`);
  }

  /**
   * Writes the given message to the log, at debug log level. 
   * @param {String} message A message to write to the log. 
   */
  logDebug(message) {
    this.log(LOG_LEVELS.DEBUG, `[DEBUG] ${message}`);
  }

  /**
   * Writes the given message to the log, at warn log level. 
   * @param {String} message A message to write to the log. 
   */
  logWarn(message) {
    this.log(LOG_LEVELS.WARN, `[WARN] ${message}`);
  }

  /**
   * Writes the given message to the log, at error log level. 
   * @param {Error | String} error An error (message) to write to the log. 
   */
  logError(error) {
    this.log(LOG_LEVELS.ERROR, `[ERROR] ${error.message ?? error}`);
  }

  /**
   * Executes and then logs the time taken for the given `functionBlock`. 
   * 
   * Outputs a `LOG_LEVELS.VERBOSE` level message. 
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

  /**
   * Executes and then logs the time taken for the given `functionBlock`. 
   * 
   * Outputs a `LOG_LEVELS.VERBOSE` level message. 
   * 
   * @param {Object} obj The context to bind the `functionBlock` to. 
   * @param {String | undefined} msg A message to output along with the time taken. 
   * @param {Function} functionBlock The async function block to execute. 
   * 
   * @async
   */
  async logPerfAsync(obj, msg, functionBlock) {
    functionBlock.bind(obj);
    const perf0 = performance.now();
    await functionBlock();
    const perf1 = performance.now();
    this.logVerbose(`Perf: ${msg} took: ${perf1 - perf0} milliseconds`);
  }

  /**
   * Writes the given message to the log, at the given log level. 
   * @param {LOG_LEVELS} level The logging level. 
   * @param {String} message A message to write to the log. 
   */
  log(level, message) {
    if (this.logLevel >= LOG_LEVELS.VERBOSE && level == LOG_LEVELS.VERBOSE) {
      console.log(message);
    } else if (this.logLevel >= LOG_LEVELS.DEBUG && level == LOG_LEVELS.DEBUG) {
      console.log(message);
    } else if (this.logLevel >= LOG_LEVELS.WARN && level == LOG_LEVELS.WARN) {
      console.warn(message);
    } else if (this.logLevel >= LOG_LEVELS.ERROR && level == LOG_LEVELS.ERROR) {
      console.error(message);
    }
  }
}