import { getNestedPropertyValue } from '../utils/property-utility.mjs';
import { selectItemByValue, getElementValue } from '../utils/sheet-utility.mjs';

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
  if (ownerSheet === undefined) {
    game.ambersteel.logger.logWarn(`No 'ownerSheet' defined. Skipping 'activateListeners'.`);
    return;
  }

  // Ensure correct option of drop-down is set. 
  for (const elem of html.find(".drop-down")) {
    const dataset = elem.dataset;
    const propertyHolder = dataset.itemId ? ownerSheet.getItem(dataset.itemId) : ownerSheet.getContextEntity();
    try {
      const actualValue = getNestedPropertyValue(propertyHolder, dataset.propertyPath);
      selectItemByValue(elem, actualValue);
    } catch (error) {
      game.ambersteel.logger.logError(error);
    }
  }

  // Ensure correct option of radio-buttons is set.
  for (const radioButtonGroup of html.find(".radio-button-group")) {
    const dataset = radioButtonGroup.dataset;
    const propertyHolder = dataset.itemId ? ownerSheet.getItem(dataset.itemId) : ownerSheet.getContextEntity();
    const actualValue = getNestedPropertyValue(propertyHolder, dataset.propertyPath);

    for (const radioButtonContainer of radioButtonGroup.children) {
      const radioButton = radioButtonContainer.getElementsByTagName("input")[0];
      radioButton.onchange = (event) => {
        radioButtonGroup.value = event.currentTarget.value;
      };
      if (actualValue == radioButton.value) {
        radioButton.checked = true;
        radioButtonContainer.className = radioButtonContainer.className + " active";
      }
    }
  }

  // -------------------------------------------------------------
  if (!isOwner) return;
  // -------------------------------------------------------------
  if (!isEditable) return;

  html.find(".ambersteel-edit").change(_onEdit.bind(ownerSheet));
}

/**
 * @param event 
 * @private
 */
async function _onEdit(event) {
  const dataset = event.currentTarget.dataset;
  const newValue = getElementValue(event.currentTarget);
  const propertyHolder = dataset.itemId ? this.getItem(dataset.itemId) : this.getContextEntity();
  // Writing data is more restrictive and is implicitly based on data.data. 
  // In order to leave reading as less restrictive, the path is shortened *here*. 
  const propertyPath = dataset.propertyPath.replace("data.data", "data");
  await propertyHolder.updateProperty(propertyPath, newValue);
}
