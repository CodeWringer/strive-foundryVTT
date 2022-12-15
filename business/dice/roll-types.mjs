/**
 * Represents a roll type. 
 * 
 * @property {String} name Internal name. 
 */
export class RollType {
  constructor(args = {}) {
    this.name = args.name;
  }
}

/**
 * Represents all defined roll types. 
 * 
 * @constant
 */
export const ROLL_TYPES = {
  /**
   * A generic roll, using Foundry's default system. 
   */
  generic: new RollType({
    name: "generic",
  }),
  /**
   * An Ambersteel dice-pool roll. 
   */
  dicePool: new RollType({
    name: "dice-pool",
  }),
}