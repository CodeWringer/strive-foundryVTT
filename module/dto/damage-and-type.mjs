/**
 * Represents the combination of damage and damage type. 
 * @property {String} args.damage
 * @property {CONFIG.ambersteel.damageTypes} args.damageType
 */
export default class DamageAndType {
  /**
   * @param {String} args.damage
   * @param {CONFIG.ambersteel.damageTypes} args.damageType
   */
  constructor(args = {}) {
    this.damage = args.damage ?? "";
    this.damageType = args.damageType ?? CONFIG.ambersteel.damageTypes.none.name;
  }
}