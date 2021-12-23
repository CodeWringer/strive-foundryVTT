/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
  html.find(".ambersteel-take-item").click(_onTakeItem.bind(ownerSheet));

  // -------------------------------------------------------------
  if (!isOwner) return;

  // -------------------------------------------------------------
  if (!isEditable) return;
}

async function _onTakeItem(event) {
  event.preventDefault();

  const dataset = event.currentTarget.dataset;
  const itemId = dataset.itemId;
}