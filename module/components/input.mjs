import * as SheetUtil from '../utils/sheet-utility.mjs';

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
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
  const newValue = SheetUtil.getElementValue(event.currentTarget);
  const propertyHolder = dataset.itemId ? this.getItem(dataset.itemId) : this.getContextEntity();
  // Writing data is more restrictive and is implicitly based on data.data. 
  // In order to leave reading as less restrictive, the path is shortened here. 
  const propertyPath = dataset.propertyPath.replace("data.data", "data");
  await propertyHolder.updateProperty(propertyPath, newValue);
}