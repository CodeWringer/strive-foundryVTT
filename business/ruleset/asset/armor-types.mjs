import * as ConstantsUtils from "../../util/constants-utility.mjs";

/**
 * Represents an armor type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class ArmorType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents the defined armor types.
 * 
 * @property {ArmorType} light
 * @property {ArmorType} medium
 * @property {ArmorType} heavy
 * 
 * @constant
 */
export const ARMOR_TYPES = {
  light: new ArmorType({
    name: "light",
    localizableName: "system.character.asset.type.armor.light"
  }),
  medium: new ArmorType({
    name: "medium",
    localizableName: "system.character.asset.type.armor.medium"
  }),
  heavy: new ArmorType({
    name: "heavy",
    localizableName: "system.character.asset.type.armor.heavy"
  }),
};
ConstantsUtils.enrichConstant(ARMOR_TYPES);
