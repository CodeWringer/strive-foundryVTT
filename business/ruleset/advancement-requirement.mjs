/**
 * @property {Number} requiredSuccessses Number of successes required. 
 * @property {Number} requiredFailures Number of failures required. 
 */
export default class AdvancementRequirements {
  constructor(args = {}) {
    args = {
      requiredSuccessses: 0,
      requiredFailures: 0,
      ...args
    }
    this.requiredSuccessses = args.requiredSuccessses;
    this.requiredFailures = args.requiredFailures;
  }
}