/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param ownerSheet {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, ownerSheet, isOwner, isEditable) {
  // Toggle skill ability list visibility. 
  html.find(".ambersteel-toggle-visibility").click(_onClickToggleVisibility.bind(ownerSheet));

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
async function _onClickToggleVisibility(event) {
  event.preventDefault();

  // Do action. 
  const visGroup = event.currentTarget.dataset.visGroup;

  const elements = document.querySelectorAll("[data-vis-group='" + visGroup + "']");

  for(const element of elements) {
    element.classList.toggle("hidden");
  }
}