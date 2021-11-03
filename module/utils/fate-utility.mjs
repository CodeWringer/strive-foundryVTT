export function prepareDerivedItemData(data) {
  data.data.localizableName = "ambersteel.fateSystem.cardsNames." + data.name;
  data.data.localizableDescription = "ambersteel.fateSystem.cardDescriptions." + data.name;
}

export function prepareDerivedActorData(context) {
  const maxCards = CONFIG.ambersteel.fateSystem.maxCards;
  const fateSystemData = context.data.data.fateSystem;

  fateSystemData.cards = (context.actor.items.filter(item => {
    return item.data.type === "fate-card"
  })).map(it => it.data);
  fateSystemData.remainingSlots = maxCards - fateSystemData.cards.length;
}

/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param owner {Object} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, owner, isOwner, isEditable) {
  if (!isOwner) return;
  if (!isEditable) return;
}