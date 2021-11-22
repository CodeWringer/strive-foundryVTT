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

  // Increment.
  html.find(".button-spinner-up").click(_onClickNumberSpinnerUp.bind(ownerSheet));

  // Decrement
  html.find(".button-spinner-down").click(_onClickNumberSpinnerDown.bind(ownerSheet));
}

/**
 * Click handler for spinner "up" buttons. 
 * @param event 
 * @private
 */
function _onClickNumberSpinnerUp(event) {
  const inputElement = event.currentTarget.closest("span.spinner-container").getElementsByTagName("input")[0];
  
  const step = inputElement.step ? parseInt(inputElement.step) : 1;
  const newValue = parseInt(inputElement.value) + step;

  setNumber(inputElement, newValue);
};

/**
 * Click handler for spinner "down" buttons. 
 * @param event 
 * @private
 */
function _onClickNumberSpinnerDown(event) {
  const inputElement = event.currentTarget.closest("span.spinner-container").getElementsByTagName("input")[0];
  
  const step = inputElement.step ? parseInt(inputElement.step) : 1;
  const newValue = parseInt(inputElement.value) - step;

  setNumber(inputElement, newValue);
};

function setNumber(inputElement, newValue) {
  const min = inputElement.min ? parseInt(inputElement.min) : undefined;
  const max = inputElement.max ? parseInt(inputElement.max) : undefined;

  if (min !== undefined && newValue < min) return;
  if (max !== undefined && newValue > max) return;

  inputElement.value = newValue;
  inputElement.dispatchEvent(new Event("change"));
}