import AssetSlot from "./asset/asset-slot.mjs";
import CharacterAssetSlotGroup from "./asset/character-asset-slot-group.mjs";
import CharacterAssetSlot from "./asset/character-asset-slot.mjs";
import CharacterAttribute from "./attribute/character-attribute.mjs";
import { combat } from "./combat/_module.mjs";
import Complication from "./complication/complication.mjs";
import { dice } from "./dice/_module.mjs";
import DomainDataField from "./domain-data-field.mjs";
import SystemHealthConditionBroker from "./health/system-health-condition-broker.mjs";
import Reference from "./reference.mjs";
import DamageAndType from "./skill/damage-and-type.mjs";
import Tag from "./tag/tag.mjs";
import TimeIncrement from "./time-increment.mjs";

export {
  DomainDataField,
  AssetSlot,
  CharacterAssetSlotGroup,
  CharacterAssetSlot,
  CharacterAttribute,
  SystemHealthConditionBroker,
  DamageAndType,
  Tag,
  combat,
  dice,
  Complication,
  Reference,
  TimeIncrement,
};

/**
 * Wraps the `business.model.domain` module, which is a bit of an oddball, 
 * as it contains all the domain specific models that cannot be cleanly 
 * categorized as anything else. 
 */
export const domain = {
  DomainDataField: DomainDataField,
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
  },
  tag: {
    Tag: Tag,
  },
  combat: combat,
  dice: dice,
  Complication: Complication,
  Reference: Reference,
  TimeIncrement: TimeIncrement,
  init: () => {
    SystemHealthConditionBroker.preload();
    combat.init();
  },
};
