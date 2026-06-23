import { common } from "../../../../common/_module.mjs";
import { ACTOR_TYPES } from "./actor-types.mjs";
import { ARMOR_TYPES, ArmorType } from "./armor-types.mjs";
import { ATTACK_TYPES, AttackType } from "./attack-types.mjs";
import { ATTRIBUTE_TYPES, AttributeType } from "./attribute-types.mjs";
import { Attribute, ATTRIBUTES } from "./attributes.mjs";
import { CHARACTER_TEST_TYPES, CharacterTestType } from "./character-test-types.mjs";
import { ComparisonType } from "./comparison-types.mjs";
import { DAMAGE_TYPES, DamageType } from "./damage-types.mjs";
import { ILLNESS_STATES, IllnessState } from "./illness-states.mjs";
import { INJURY_SHRUG_OFF_STATES } from "./injury-shrug-off-states.mjs";
import { INJURY_STATES, InjuryState } from "./injury-states.mjs";
import { ITEM_TYPES } from "./item-types.mjs";
import { SHIELD_TYPES, ShieldType } from "./shield-types.mjs";
import { ASSET_TAGS, SKILL_TAGS } from "./system-tags.mjs";
import { VISIBILITY_MODES, VisibilityMode } from "./visibility-modes.mjs";
import { WEAPON_TYPES, WeaponType } from "./weapon-types.mjs";

export {
  INJURY_SHRUG_OFF_STATES,
  ITEM_TYPES,
  ACTOR_TYPES,
  ArmorType,
  ARMOR_TYPES,
  AttackType,
  ATTACK_TYPES,
  AttributeType,
  ATTRIBUTE_TYPES,
  Attribute,
  ATTRIBUTES,
  CharacterTestType,
  CHARACTER_TEST_TYPES,
  DamageType,
  DAMAGE_TYPES,
  IllnessState,
  ILLNESS_STATES,
  INJURY_SHRUG_OFF_STATES,
  InjuryState,
  INJURY_STATES,
  ShieldType,
  SHIELD_TYPES,
  ASSET_TAGS,
  SKILL_TAGS,
  VisibilityMode,
  VISIBILITY_MODES,
  WeaponType,
  WEAPON_TYPES,
  ComparisonType,
};

/**
 * Wraps the `business.model.const` module.
 */
export const constants = {
  INJURY_SHRUG_OFF_STATES: INJURY_SHRUG_OFF_STATES,
  ITEM_TYPES: ITEM_TYPES,
  ACTOR_TYPES: ACTOR_TYPES,
  ArmorType: ArmorType,
  ARMOR_TYPES: ARMOR_TYPES,
  AttackType: AttackType,
  ATTACK_TYPES: ATTACK_TYPES,
  AttributeType: AttributeType,
  ATTRIBUTE_TYPES: ATTRIBUTE_TYPES,
  Attribute: Attribute,
  ATTRIBUTES: ATTRIBUTES,
  CharacterTestType: CharacterTestType,
  CHARACTER_TEST_TYPES: CHARACTER_TEST_TYPES,
  DamageType: DamageType,
  DAMAGE_TYPES: DAMAGE_TYPES,
  IllnessState: IllnessState,
  ILLNESS_STATES: ILLNESS_STATES,
  INJURY_SHRUG_OFF_STATES: INJURY_SHRUG_OFF_STATES,
  InjuryState: InjuryState,
  INJURY_STATES: INJURY_STATES,
  ShieldType: ShieldType,
  SHIELD_TYPES: SHIELD_TYPES,
  ASSET_TAGS: ASSET_TAGS,
  SKILL_TAGS: SKILL_TAGS,
  VisibilityMode: VisibilityMode,
  VISIBILITY_MODES: VISIBILITY_MODES,
  WeaponType: WeaponType,
  WEAPON_TYPES: WEAPON_TYPES,
  ComparisonType: ComparisonType,
  init: () => {
    common.util.constants.enrichConstant(ACTOR_TYPES);
    common.util.constants.enrichConstant(ITEM_TYPES);
    common.util.constants.enrichConstant(ARMOR_TYPES);
    common.util.constants.enrichConstant(TIME_UNITS);
    common.util.constants.enrichConstant(ATTACK_TYPES);
    common.util.constants.enrichConstant(ATTRIBUTE_TYPES);
    common.util.constants.enrichConstant(COMPARISON_TYPES);
    common.util.constants.enrichConstant(ATTRIBUTES);
    common.util.constants.enrichConstant(CHARACTER_TEST_TYPES);
    common.util.constants.enrichConstant(DAMAGE_TYPES);
    common.util.constants.enrichConstant(ILLNESS_STATES);
    common.util.constants.enrichConstant(INJURY_SHRUG_OFF_STATES);
    common.util.constants.enrichConstant(INJURY_STATES);
    common.util.constants.enrichConstant(SHIELD_TYPES);
    common.util.constants.enrichConstant(ASSET_TAGS);
    common.util.constants.enrichConstant(SKILL_TAGS);
    common.util.constants.enrichConstant(VISIBILITY_MODES);
    common.util.constants.enrichConstant(WEAPON_TYPES);
  },
};
