import * as ItemAddDialog from '../dialog/dialog-item-add.mjs';
import { findItem, contentCollectionTypes } from '../utils/content-utility.mjs';

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

  let createCustom = true;
  let itemId = undefined;

  // Special case, because skill abilities aren't actual items.
  // TODO: Refactor skill abilities into proper items? Would need to work as items owned by items. 
  if (type === "skill-ability") {
    const item = dataset.itemId ? this.getItem(dataset.itemId) : this.getContextEntity();
    if (item.type !== "skill") {
      console.warn("Trying to add skill-ability to non-'skill'-type item!");
      return;
    }
    const creationData = {
      ...getCreationData(dataset),
      isCustom: true
    };
    item.createSkillAbility(creationData);
    return;
  }

  const withDialog = dataset.withDialog === "true";
  if (withDialog) {
    let dialogResult = undefined;
    if (type === "skill") {
      dialogResult = await ItemAddDialog.query("skill", "ambersteel.labels.skill", "ambersteel.dialog.titleSkillAddQuery");
    } else if (type === "injury") {
      dialogResult = await ItemAddDialog.query("injury", "ambersteel.labels.injury", "ambersteel.dialog.titleInjuryAddQuery");
    } else if (type === "illness") {
      dialogResult = await ItemAddDialog.query("illness", "ambersteel.labels.illness", "ambersteel.dialog.titleIllnessAddQuery");
    } else if (type === "fate-card") {
      dialogResult = await ItemAddDialog.query("fate-card", "ambersteel.labels.fateCard", "ambersteel.dialog.titleFateCardAddQuery");
    } else if (type === "item") {
      dialogResult = await ItemAddDialog.query("item", "ambersteel.labels.item", "ambersteel.dialog.titleAddItemQuery");
    } else {
      console.warn(`Add dialog not defined for type '${type}'!`);
      return;
    }
    if (!dialogResult.confirmed) return;
    createCustom = dialogResult.isCustomChecked === true;
    itemId = dialogResult.selected;
  }

  const parent = dataset.itemId ? this.getItem(dataset.itemId) : this.getContextEntity();
  const creationData = {
    ...getCreationData(dataset),
      isCustom: createCustom
  };

  if (createCustom) {
    const itemData = {
      name: `New ${type.capitalize()}`,
      type: type,
      data: creationData
    };
    
    return await Item.create(itemData, { parent: parent });
  } else {
    const item = await findItem(itemId, contentCollectionTypes.all);
    const itemData = {
      name: item ? item.name : `New ${type.capitalize()}`,
      type: item ? item.type : type,
      data: {
        ...(item ? item.data.data : {}),
        ...creationData
      }
    };
    
    return await Item.create(itemData, { parent: parent });
  }
}

function getCreationData(dataset) {
  const creationData = Object.create(null);
  const prefix = "creation";
  for (const propertyName in dataset) {
    if (propertyName.startsWith(prefix)) {
      const propertyValue = dataset[propertyName];
      let cleanedPropertyName = propertyName.substring(prefix.length);
      cleanedPropertyName = cleanedPropertyName.substring(0, 1).toLowerCase() + cleanedPropertyName.substring(1);
      creationData[cleanedPropertyName] = propertyValue;
    }
  }
  return creationData;
}