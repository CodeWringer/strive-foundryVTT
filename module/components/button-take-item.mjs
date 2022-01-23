import { showSelectionDialog } from "../utils/dialog-utility.mjs";
import { showPlainDialog } from "../utils/dialog-utility.mjs";
import { updateProperty } from "../utils/document-update-utility.mjs";
import { findItem, contentCollectionTypes } from "../utils/content-utility.mjs";

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
  const sourceType = dataset.sourceType;
  const sourceId = dataset.sourceId;

  const currentUser = game.user;
  let actor = undefined;
  let item = undefined;

  if (this !== undefined && this.getActor) {
    // Currently in the context of an actor sheet. 
    // This means the item was probably "picked up" from the list of property (belongings not on person).

    actor = this.getActor();
    item = this.getItem(itemId);
  } else {
    // Currently in the context of a chat message or item sheet (or anywhere else). 
    // For this to work, the HTML button element *must* have a 'dataset-source-type' and a 'dataset-source-id' attribute. 
    // Allowed 'sourceTypes' are: 'actor', 'world', 'compendium'

    // TODO: Add a copy to the property (not on person) list of target. 

    // TODO: Remove from source. 

    // TODO: Try to move the item to the item grid. 
  }

  if (item === undefined) {
    console.warn(`Failed to get item with id '${sourceId}'! Cannot add to item grid!`);
    return;
  }

  const addResult = actor.itemGrid.add(item);
  if (addResult === true) {
    updateProperty(item, "data.data.isOnPerson", true);
    actor.itemGrid.synchronize();
  } else {
    showPlainDialog({
      localizableTitle: game.i18n.localize("ambersteel.dialog.titleInventoryFull"),
      localizedContent: game.i18n.localize("ambersteel.dialog.contentInventoryFull")
    });
  }
}

// if (sourceType === "actor") {
//   // The assumption here is that the source actor is owned by the world and isn't 
//   // nested in a compendium. 

//   // TODO: Add (a copy) to target actor. 

//   // Remove from source actor. 
//   const sourceActor = game.actors.get(sourceId);
//   sourceActor.itemGrid.remove(item);
//   sourceActor.items.delete(itemId);
//   sourceActor.itemGrid.synchronize();
// } else if (sourceType === "world") {
//   // TODO: Add (a copy) to target actor. 

  
//   // Remove from world. 
//   item.delete();
// }