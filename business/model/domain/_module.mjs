import AssetSlot from "./asset/asset-slot.mjs";
import CharacterAssetSlotGroup from "./asset/character-asset-slot-group.mjs";
import CharacterAssetSlot from "./asset/character-asset-slot.mjs";
import CharacterAttribute from "./attribute/character-attribute.mjs";
import SystemHealthConditionBroker from "./health/system-health-condition-broker.mjs";
import DamageAndType from "./skill/damage-and-type.mjs";

export {
  AssetSlot,
  CharacterAssetSlotGroup,
  CharacterAssetSlot,
  CharacterAttribute,
  SystemHealthConditionBroker,
  DamageAndType,
};

/**
 * Wraps the `business.model.domain` module, which is a bit of an oddball, 
 * as it contains all the domain specific models that cannot be cleanly 
 * categorized as anything else. 
 */
export const domain = {
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
  init: () => {
    SystemHealthConditionBroker.preload();
  },
};
