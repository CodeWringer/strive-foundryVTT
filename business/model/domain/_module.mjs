import AssetSlot from "./asset/asset-slot.mjs";
import CharacterAssetSlotGroup from "./asset/character-asset-slot-group.mjs";
import CharacterAssetSlot from "./asset/character-asset-slot.mjs";
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

export {
  Persistable as DomainDataField,
  AssetSlot,
  CharacterAssetSlotGroup,
  CharacterAssetSlot,
  CharacterAttribute,
  SystemHealthConditionBroker,
  DamageAndType,
  Expertise,
  Tag,
  combat,
  dice,
  Complication,
  Reference,
  TimeIncrement,
  MomentumAction,
  Ruleset,
  Sum,
  SumComponent,
  Modifier,
  HealthConditionEffect,
  GradedEffect,
};

/**
 * Wraps the `business.model.domain` module, which is a bit of an oddball, 
 * as it contains all the domain specific models that cannot be cleanly 
 * categorized as anything else. 
 */
export const domain = {
  DomainDataField: Persistable,
  asset: {
    AssetSlot: AssetSlot,
    CharacterAssetSlotGroup: CharacterAssetSlotGroup,
    CharacterAssetSlot: CharacterAssetSlot,
  },
  attribute: {
    CharacterAttribute: CharacterAttribute,
  },
  health: {
    SystemHealthConditionBroker: SystemHealthConditionBroker,
  },
  skill: {
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
  init: () => {
    SystemHealthConditionBroker.preload();
    combat.init();
  },
};
