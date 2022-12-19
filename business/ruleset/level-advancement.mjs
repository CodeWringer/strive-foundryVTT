/**
 * @property {Number} successes Number of successes required. 
 * * Default `0`. 
 * @property {Number} failures Number of failures required. 
 * * Default `0`. 
 */
export default class LevelAdvancement {
  /**
  * @param {Number | undefined} successes Number of successes required. 
  * * Default `0`. 
  * @param {Number | undefined} failures Number of failures required. 
  * * Default `0`. 
  */
  constructor(args = {}) {
    this.successes = args.successes ?? 0;
    this.failures = args.failures ?? 0;
  }
}