import Tag from "./tag.mjs";
import * as ConstantsUtils from "../util/constants-utility.mjs";

/**
 * Property constants of "item/asset" type documents. 
 * 
 * @constant
 * 
 * @property {Tag} AMBERSTEEL_FORGED
 * @property {Tag} AMBERSTEEL_LINED
 * @property {Tag} AMBERSTEEL_PLATED
 * @property {Tag} ARMOR
 * @property {Tag} CLOTHING
 * @property {Tag} COUNTER_ATTACK
 * @property {Tag} EXHAUSTING_TO_WIELD
 * @property {Tag} HOLDABLE
 * @property {Tag} LONG_REACH
 * @property {Tag} MELEE
 * @property {Tag} MELEE_ONLY
 * @property {Tag} PREFER_MELEE
 * @property {Tag} PREFER_RANGE
 * @property {Tag} RANGE
 * @property {Tag} RANGE_ONLY
 * @property {Tag} VERY_LONG_REACH
 * @property {Tag} WEAPON
 */
export const ASSET_TAGS = {
  LONG_REACH: new Tag({
    id: "LONG_REACH",
    localizableName: "system.character.asset.properties.longReach"
  }),
  VERY_LONG_REACH: new Tag({
    id: "VERY_LONG_REACH",
    localizableName: "system.character.asset.properties.veryLongReach"
  }),
  RANGE: new Tag({
    id: "RANGE",
    localizableName: "system.character.asset.properties.range"
  }),
  RANGE_ONLY: new Tag({
    id: "RANGE_ONLY",
    localizableName: "system.character.asset.properties.rangeOnly"
  }),
  PREFER_RANGE: new Tag({
    id: "PREFER_RANGE",
    localizableName: "system.character.asset.properties.preferRange"
  }),
  MELEE: new Tag({
    id: "MELEE",
    localizableName: "system.character.asset.properties.melee"
  }),
  MELEE_ONLY: new Tag({
    id: "MELEE_ONLY",
    localizableName: "system.character.asset.properties.meleeOnly"
  }),
  PREFER_MELEE: new Tag({
    id: "PREFER_MELEE",
    localizableName: "system.character.asset.properties.preferMelee"
  }),
  AMBERSTEEL_LINED: new Tag({
    id: "AMBERSTEEL_LINED",
    localizableName: "system.character.asset.properties.ambersteelLined"
  }),
  AMBERSTEEL_PLATED: new Tag({
    id: "AMBERSTEEL_PLATED",
    localizableName: "system.character.asset.properties.ambersteelPlated"
  }),
  AMBERSTEEL_FORGED: new Tag({
    id: "AMBERSTEEL_FORGED",
    localizableName: "system.character.asset.properties.ambersteelForged"
  }),
  EXHAUSTING_TO_WIELD: new Tag({
    id: "EXHAUSTING_TO_WIELD",
    localizableName: "system.character.asset.properties.exhaustingToWield"
  }),
  HOLDABLE: new Tag({
    id: "HOLDABLE",
    localizableName: "system.character.asset.properties.holdable"
  }),
  ARMOR: new Tag({
    id: "ARMOR",
    localizableName: "system.character.asset.properties.armor"
  }),
  CLOTHING: new Tag({
    id: "CLOTHING",
    localizableName: "system.character.asset.properties.clothing"
  }),
  COUNTER_ATTACK: new Tag({
    id: "COUNTER_ATTACK",
    localizableName: "system.character.asset.properties.counterAttack"
  }),
  WEAPON: new Tag({
    id: "WEAPON",
    localizableName: "system.character.asset.properties.weapon"
  }),
}
ConstantsUtils.enrichConstant(ASSET_TAGS);

/**
 * Property constants of "skill" type documents. 
 * 
 * @constant
 * 
 * @property {Tag} MAGIC_SCHOOL
 * @property {Tag} INNATE
 */
export const SKILL_TAGS = {
  MAGIC_SCHOOL: new Tag({
    id: "MAGIC_SCHOOL",
    localizableName: "system.character.skill.properties.magicSchool"
  }),
  INNATE: new Tag({
    id: "INNATE",
    localizableName: "system.character.skill.properties.innate"
  }),
}
ConstantsUtils.enrichConstant(SKILL_TAGS);
