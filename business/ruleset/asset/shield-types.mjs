import { ConstantsUtil } from "../../util/constants-utility.mjs";

/**
 * Represents a shield type. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class ShieldType {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents the defined shield types.
 * 
 * @property {ShieldType} buckler 
 * @property {ShieldType} roundShield 
 * @property {ShieldType} heaterShield 
 * @property {ShieldType} kiteShield 
 * 
 * @constant
 */
export const SHIELD_TYPES = {
  buckler: new ShieldType({
    name: "buckler",
    localizableName: "system.character.asset.type.shield.buckler"
  }),
  roundShield: new ShieldType({
    name: "roundShield",
    localizableName: "system.character.asset.type.shield.roundShield"
  }),
  heaterShield: new ShieldType({
    name: "heaterShield",
    localizableName: "system.character.asset.type.shield.heaterShield"
  }),
  kiteShield: new ShieldType({
    name: "kiteShield",
    localizableName: "system.character.asset.type.shield.kiteShield"
  }),
};
ConstantsUtil.enrichConstant(SHIELD_TYPES);
