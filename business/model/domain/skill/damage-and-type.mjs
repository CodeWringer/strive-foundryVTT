import { DAMAGE_TYPES, DamageType } from "../../const/damage-types.mjs";
import Persistable from "../persistable.mjs";

/**
 * Represents the combination of damage and damage type. 
 * 
 * @property {String} damage A damage formula. May contain at-references. 
 * @property {DamageType} type
 * 
 * @extends Persistable
 */
export default class DamageAndType extends Persistable {
  /**
   * Converts the given DTO to an instance of this type and returns it. 
   * 
   * @param {Object} dto 
   * 
   * @returns {DamageAndType}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new DamageAndType({
      damage: dto.damage,
      type: DAMAGE_TYPES[dto.type],
    });
  }

  /**
   * @param {Object} args 
   * @param {String} args.damage A damage formula. May contain at-references. 
   * @param {DamageType} args.type
   */
  constructor(args = {}) {
    super(args);
    
    this.damage = args.damage ?? "0";
    this.type = args.type ?? DAMAGE_TYPES.pure;
  }

  /**
   * Converts this instance to a DTO and returns it. 
   * 
   * @returns {Object}
   * @override
   */
  toDto() {
    return {
      damage: this.damage,
      type: this.type.name,
    };
  }
}
