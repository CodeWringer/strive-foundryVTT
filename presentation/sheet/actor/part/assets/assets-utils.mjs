import * as StringUtil from "../../../../../business/util/string-utility.mjs";
import DynamicInputDefinition from "../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";

/**
 * Queries the user for input for a character asset slot and returns the 
 * inputs made. 
 * 
 * @param {CharacterAssetSlot | undefined} assetSlot
 * 
 * @returns {Object} Returns an object with the input values. 
 * * Has the fields: 
 * * * `name: {String}`
 * * * `maxBulk: {Number}`
 * * * `acceptedTypes: {Array<String>}`
 * 
 * @async
 */
export async function queryAssetSlotConfiguration(assetSlot = {}) {
  const inputName = "name";
  const inputAcceptedTypes = "acceptedTypes";
  const inputMaxBulk = "maxBulk";

  const dialog = await new DynamicInputDialog({
    localizedTitle: StringUtil.format(
      game.i18n.localize("ambersteel.general.input.queryFor"), 
      game.i18n.localize("ambersteel.character.asset.slot.label"), 
    ),
    inputDefinitions: [
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
        name: inputName,
        localizableLabel: "ambersteel.general.name",
        required: true,
        defaultValue: (assetSlot.name ?? "New Asset Slot"),
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
        name: inputAcceptedTypes,
        localizableLabel: "ambersteel.character.asset.slot.acceptedTypes",
        required: true,
        defaultValue: ((assetSlot.acceptedTypes ?? []).join(", ")),
        specificArgs: {
          placeholder: "holdable, armor, ..."
        },
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
        name: inputMaxBulk,
        localizableLabel: "ambersteel.character.asset.maxBulk",
        required: false,
        defaultValue: (assetSlot.maxBulk ?? 1),
        specificArgs: {
          min: 1
        },
        validationFunc: (value) => {
          try {
            const int = parseInt(value);
            if (int < 1) {
              return false;
            }
            return true;
          } catch {
            return false;
          }
        },
      }),
    ],
  }).renderAndAwait(true);
  
  if (dialog.confirmed !== true) return;

  const name = dialog[inputName];
  const maxBulk = parseInt(dialog[inputMaxBulk]);
  const acceptedTypes = dialog[inputAcceptedTypes].split(",");
  for (let i = 0; i < acceptedTypes.length; i++) {
    acceptedTypes[i] = acceptedTypes[i].trim();
  }

  return {
    name: name,
    maxBulk: maxBulk,
    acceptedTypes: acceptedTypes,
  }
}