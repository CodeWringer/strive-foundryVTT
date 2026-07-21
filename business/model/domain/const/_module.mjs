import { common } from "../../../../common/_module.mjs";
import { ACTOR_TYPES } from "./actor-types.mjs";
import { ATTACK_TYPES, AttackType } from "./attack-types.mjs";
import { ATTRIBUTE_TYPES, AttributeType } from "./attribute-types.mjs";
import { Attribute, ATTRIBUTES } from "./attributes.mjs";
import { CHARACTER_TEST_TYPES, CharacterTestType } from "./character-test-types.mjs";
import { COMPARISON_TYPES, ComparisonType } from "./comparison-types.mjs";
import { DAMAGE_TYPES, DamageType } from "./damage-types.mjs";
import { ILLNESS_STATES, IllnessState } from "./illness-states.mjs";
import { INJURY_SHRUG_OFF_STATES, InjuryShrugOffState } from "./injury-shrug-off-states.mjs";
import { INJURY_STATES, InjuryState } from "./injury-states.mjs";
import { ITEM_TYPES } from "./item-types.mjs";
import { LANGUAGE_GRADES, LanguageGrade } from "./language-grades.mjs";
import { LANGUAGE_READ_WRITE, LanguageReadWriteState } from "./language-read-write-states.mjs";
import { TIME_UNITS, TimeUnit } from "./time-units.mjs";
import { VISIBILITY_MODES, VisibilityMode } from "./visibility-modes.mjs";

/**
 * Wraps the `business.model.const` module.
 */
export const constants = {
  ITEM_TYPES: ITEM_TYPES,
  ACTOR_TYPES: ACTOR_TYPES,
  TimeUnit: TimeUnit,
  TIME_UNITS: TIME_UNITS,
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
  InjuryShrugOffState: InjuryShrugOffState,
  INJURY_SHRUG_OFF_STATES: INJURY_SHRUG_OFF_STATES,
  InjuryState: InjuryState,
  INJURY_STATES: INJURY_STATES,
  VisibilityMode: VisibilityMode,
  VISIBILITY_MODES: VISIBILITY_MODES,
  LanguageGrade: LanguageGrade,
  LANGUAGE_GRADES: LANGUAGE_GRADES,
  LanguageReadWriteState: LanguageReadWriteState,
  LANGUAGE_READ_WRITE: LANGUAGE_READ_WRITE,
  ComparisonType: ComparisonType,
  init: () => {
    common.util.constants.enrichConstant(ACTOR_TYPES);
    common.util.constants.enrichConstant(ITEM_TYPES);
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
    common.util.constants.enrichConstant(VISIBILITY_MODES);
    common.util.constants.enrichConstant(LANGUAGE_GRADES);
    common.util.constants.enrichConstant(LANGUAGE_READ_WRITE);
  },
};
