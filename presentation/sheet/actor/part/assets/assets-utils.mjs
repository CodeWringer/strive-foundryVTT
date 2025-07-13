import { StringUtil } from "../../../../../business/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../../../component/input-textfield/input-textfield-viewmodel.mjs";
import DynamicInputDefinition from "../../../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";

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
      new DynamicInputDefinition({
        name: inputName,
        localizedLabel: game.i18n.localize("system.general.name.label"),
        template: InputTextFieldViewModel.TEMPLATE,
        viewModelFactory: (id, parent) => new InputTextFieldViewModel({
          id: id,
          parent: parent,
          value: (assetSlot.name ?? "New Asset Slot"),
        }),
        required: true,
        validationFunc: (value) => { return ValidationUtil.isNotBlankOrUndefined(value); },
      }),
      new DynamicInputDefinition({
        name: inputAcceptedTypes,
        localizedLabel: game.i18n.localize("system.character.asset.slot.acceptedTypes"),
        template: InputTextFieldViewModel.TEMPLATE,
        viewModelFactory: (id, parent) => new InputTextFieldViewModel({
          id: id,
          parent: parent,
          value: ((assetSlot.acceptedTypes ?? []).join(", ")),
          placeholder: "holdable, armor, ..."
        }),
      }),
      new DynamicInputDefinition({
        name: inputMaxBulk,
        localizedLabel: game.i18n.localize("system.character.asset.maxBulk"),
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModelFactory: (id, parent) => new InputNumberSpinnerViewModel({
          id: id,
          parent: parent,
          value: (assetSlot.maxBulk ?? 1),
          min: 1,
        }),
        required: true,
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