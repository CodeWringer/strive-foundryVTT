import { queryVisibilityMode } from '../utils/chat-utility.mjs';

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
  html.find(".ambersteel-send-to-chat").click(_onSendToChat.bind(ownerSheet));

  // -------------------------------------------------------------
  if (!isOwner) return;

  // -------------------------------------------------------------
  if (!isEditable) return;
}

async function _onSendToChat(event) {
  event.preventDefault();

  const dialogResult = await queryVisibilityMode();
  if (!dialogResult.confirmed) return;
  
  // Do action. 
  const dataset = event.currentTarget.element.dataset;
  if (dataset.propertyPath) {
    this.sendPropertyToChat(dataset.propertyPath, dialogResult.visibilityMode);
  } else {
    this.sendToChat(dialogResult.visibilityMode);
  }

  // Invoke callback. 
  if (dataset.callback) {
    this[dataset.callback](dataset.callbackData);
  }
}