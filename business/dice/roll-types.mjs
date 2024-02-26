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
 * @property {RollType} generic A generic roll, using Foundry's default system. 
 * @property {RollType} dicePool A dice-pool roll. 
 * 
 * @constant
 */
export const ROLL_TYPES = {
  generic: new RollType({
    name: "generic",
  }),
  dicePool: new RollType({
    name: "dice-pool",
  }),
}