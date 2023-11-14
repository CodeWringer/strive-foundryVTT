import { DAMAGE_TYPES, DamageType } from "../damage-types.mjs";

/**
 * Represents the combination of damage and damage type. 
 * 
 * @property {String} args.damage
 * @property {DamageType} args.damageType
 */
export default class DamageAndType {
  /**
   * Converts the given DTO to an instance of this type and returns it. 
   * 
   * @param {Object} dto 
   * 
   * @returns {DamageAndType}
   * 
   * @static
   */
  static fromDto(dto) {
    return new DamageAndType({
      damage: dto.damage,
      damageType: DAMAGE_TYPES[dto.damageType],
    });
  }

  /**
   * @param {Object} args 
   * @param {String} args.damage
   * @param {DamageType} args.damageType
   */
  constructor(args = {}) {
    this.damage = args.damage ?? "";
    this.damageType = args.damageType ?? DAMAGE_TYPES.none.name;
  }

  /**
   * Converts this instance to a DTO and returns it. 
   * 
   * @returns {Object}
   */
  toDto() {
    return {
      damage: this.damage,
      damageType: this.damageType.name,
    }
  }
}