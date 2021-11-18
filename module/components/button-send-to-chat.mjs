/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param owner {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, owner, isOwner, isEditable) {
  // Send item to chat. 
  html.find(".ambersteel-item-to-chat").click(_onItemSendToChat.bind(owner));

  // Send item property to chat.
  html.find(".ambersteel-item-property-to-chat").click(_onItemPropertySendToChat.bind(owner));

  // Send actor to chat. 
  html.find(".ambersteel-actor-to-chat").click(_onActorSendToChat.bind(owner));
  
  // -------------------------------------------------------------
  if (!isOwner) return;

  // -------------------------------------------------------------
  if (!isEditable) return;
}