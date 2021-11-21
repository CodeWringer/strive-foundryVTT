import * as ComponentUtil from './component-utility.mjs';

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

  // Delete item. 
  html.find(".ambersteel-item-delete").click(_onItemDelete.bind(ownerSheet));

  // Delete skill ability.
  html.find(".ambersteel-skill-ability-delete").click(_onDeleteSkillAbility.bind(ownerSheet));
}