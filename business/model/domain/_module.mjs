import { constants } from "./const/_module.mjs";
import AssetSlot from "./asset/asset-slot.mjs";
import CharacterAttribute from "./attribute/character-attribute.mjs";
import { combat } from "./combat/_module.mjs";
import Complication from "./complication/complication.mjs";
import { dice } from "./dice/_module.mjs";
import Persistable from "./persistable.mjs";
import GradedEffect from "./graded-effect.mjs";
import SystemHealthConditionBroker from "./health/system-health-condition-broker.mjs";
import Modifier from "./modifier.mjs";
import MomentumAction from "./momentum-action.mjs";
import Reference from "./reference.mjs";
import Ruleset from "./ruleset.mjs";
import DamageAndType from "./skill/damage-and-type.mjs";
import Expertise from "./skill/expertise.mjs";
import { Sum, SumComponent } from "./summed-data.mjs";
import Tag from "./tag/tag.mjs";
import TimeIncrement from "./time-increment.mjs";
import HealthConditionEffect from "./health-condition-effect.mjs";
import InjuryShrugOff from "./health/injury-shrug-off.mjs";
import PropertyLocation from "./asset/property-location.mjs";
import AdvancementHistoryEntry from "./advancement-history-entry.mjs";
import DriverHistoryEntry from "./driver-history-entry.mjs";
import { Skill } from "./skill/skill.mjs";

/**
 * Wraps the `business.model.domain` module, which is a bit of an oddball, 
 * as it contains all the domain specific models that cannot be cleanly 
 * categorized as anything else. 
 */
export const domain = {
  const: constants,
  Persistable: Persistable,
  asset: {
    AssetSlot: AssetSlot,
    PropertyLocation: PropertyLocation,
  },
  attribute: {
    CharacterAttribute: CharacterAttribute,
  },
  health: {
    SystemHealthConditionBroker: SystemHealthConditionBroker,
    InjuryShrugOff: InjuryShrugOff,
  },
  skill: {
    Skill: Skill,
    DamageAndType: DamageAndType,
    Expertise: Expertise,
  },
  tag: {
    Tag: Tag,
  },
  combat: combat,
  dice: dice,
  Complication: Complication,
  Reference: Reference,
  TimeIncrement: TimeIncrement,
  MomentumAction: MomentumAction,
  Ruleset: Ruleset,
  Sum: Sum,
  SumComponent: SumComponent,
  Modifier: Modifier,
  HealthConditionEffect: HealthConditionEffect,
  GradedEffect: GradedEffect,
  AdvancementHistoryEntry: AdvancementHistoryEntry,
  DriverHistoryEntry: DriverHistoryEntry,
  init: () => {
    constants.init();
    SystemHealthConditionBroker.preload();
    combat.init();
    dice.init();
  },
};
