import { findDocument } from "../utils/content-utility.mjs";

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {Any} Unused. Only exists for the sake of convention. 
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
  // -------------------------------------------------------------
  if (!isOwner) return;
  // -------------------------------------------------------------
  if (!isEditable) return;

  // No binding necessary, as the DOM is the only required context. 
  html.find(".ambersteel-open-sheet").click(_onClickOpenSheet);
}

/**
 * @param event 
 * @async
 * @private
 */
async function _onClickOpenSheet(event) {
  event.preventDefault();
  
  const dataset = event.currentTarget.dataset;
  
  if (dataset.itemId) {
    const parent = await findDocument(dataset.id);
    const item = parent.items.get(dataset.itemId);
    item.sheet.render(true);
  } else {
    const toShow = await findDocument(dataset.id);
    if (!toShow) return;
    toShow.sheet.render(true);
  }
};
