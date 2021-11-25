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

  // Create item. 
  html.find(".ambersteel-item-create").click(_onItemCreate.bind(ownerSheet));
}

/**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   * @async
   */
async function _onItemCreate(event) {
  event.preventDefault();

  const dataset = event.currentTarget.dataset;
  const type = dataset.type;
  const data = duplicate(dataset);
  
  const itemData = {
    name: `New ${type.capitalize()}`,
    type: type,
    data: data
  };
  // Remove the type from the dataset since it's already in the 'itemData.type' property.
  delete itemData.data["type"];

  const parent = dataset.itemId ? this.getItem(dataset.itemId) : this.getContextEntity();

  return await Item.create(itemData, { parent: parent });
}