import { StringUtil } from "../../../../../business/util/string-utility.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import DynamicInputDefinitionNumberSpinner from "../../../../dialog/dynamic-input-dialog/input-types/dynamic-input-definition-number-spinner.mjs";
import DynamicInputDefinitionTextfield from "../../../../dialog/dynamic-input-dialog/input-types/dynamic-input-definition-textfield.mjs";

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
      game.i18n.localize("system.general.input.queryFor"), 
      game.i18n.localize("system.character.asset.slot.label"), 
    ),
    inputDefinitions: [
      new DynamicInputDefinitionTextfield({
        name: inputName,
        localizedLabel: game.i18n.localize("system.general.name.label"),
        required: true,
        defaultValue: (assetSlot.name ?? "New Asset Slot"),
      }),
      new DynamicInputDefinitionTextfield({
        name: inputAcceptedTypes,
        localizedLabel: game.i18n.localize("system.character.asset.slot.acceptedTypes"),
        required: false,
        defaultValue: ((assetSlot.acceptedTypes ?? []).join(", ")),
        placeholder: "holdable, armor, ..."
      }),
      new DynamicInputDefinitionNumberSpinner({
        name: inputMaxBulk,
        localizedLabel: game.i18n.localize("system.character.asset.maxBulk"),
        required: false,
        defaultValue: (assetSlot.maxBulk ?? 1),
        min: 1,
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