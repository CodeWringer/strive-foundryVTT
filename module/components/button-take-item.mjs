import { updateProperty } from "../utils/document-update-utility.mjs";

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

  const currentUser = game.user;
  const contextActor = this.getActor();

  if (contextActor !== undefined) {
    // Currently in the context of an actor sheet. 

    const item = this.getItem(itemId);
    updateProperty(item, "data.isOnPerson", true);
  } else if (currentUser.isGM !== true) {
    // Currently in the context of a chat message or item sheet (or anywhere else). 

    const actor = game.actors.getName(game.user.charname);
    const item = actor.items.get(itemId);

    if (item === undefined) {
      // The item is not yet on the actor. 
  
      // Remove the item from its current parent, if it has one. 
      const parent = item.parent;
      if (parent !== undefined && parent !== null) {
        parent.items.remove(item);
      }
  
      // Add the item to the current user's character. 
      actor.items.add(item);
    } else {
      // The item is already on the actor and only has to be set to be on person. 
      updateProperty(item, "data.isOnPerson", true);
    }
  } else {
    // Currently in the context of a GM. 

    // TODO: Show dialog prompt to select the character to put the item on. 
  }
}
