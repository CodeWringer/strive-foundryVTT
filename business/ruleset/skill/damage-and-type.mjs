import { DAMAGE_TYPES } from "../damage-types.mjs";

/**
 * Represents the combination of damage and damage type. 
 * @property {String} args.damage
 * @property {DamageType} args.damageType
 */
export default class DamageAndType {
  /**
   * @param {String} args.damage
   * @param {DamageType} args.damageType
   */
  constructor(args = {}) {
    this.damage = args.damage ?? "";
    this.damageType = args.damageType ?? DAMAGE_TYPES.none.name;
  }
}