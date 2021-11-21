/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
  // Toggle skill ability list visibility. 
  html.find(".ambersteel-expand-skill-ability-list").click(_onExpandSkillAbilityList.bind(ownerSheet));

  // -------------------------------------------------------------
  if (!isOwner) return;

  // -------------------------------------------------------------
  if (!isEditable) return;
}

/**
 * @param event 
 * @private
 * @async
 */
async function _onExpandSkillAbilityList(event) {
  event.preventDefault();

  const dataset = event.currentTarget.element.dataset;
  await this.toggleSkillAbilityListVisible(dataset.itemId);

  // Invoke callback. 
  if (dataset.callback) {
    this[dataset.callback](dataset.callbackData);
  }
}