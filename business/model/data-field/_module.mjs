import AssetSlotField from "./asset-slot-field.mjs";
import CharacterAttributeField from "./character-attribute-field.mjs";
import InjuryShrugOffField from "./injury-shrug-off-field.mjs";

export {
  AssetSlotField,
  CharacterAttributeField as AttributeField,
  InjuryShrugOffField,
};

export const dataField = {
  AssetSlotField: AssetSlotField,
  AttributeField: CharacterAttributeField,
  InjuryShrugOffField: InjuryShrugOffField,
};
