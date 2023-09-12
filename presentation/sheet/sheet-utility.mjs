/**
 * Returns the current value of the given DOM element. 
 * 
 * Supports drop down (= "select") and checkbox. 
 * 
 * @param {HTMLElement} element A DOM element. 
 * 
 * @returns {String} The value of the element. 
 */
export function getElementValue(element) {
  const pureElement = unwrapJQueryElement(element);

  if (pureElement.tagName.toLowerCase() === "select") {
    return pureElement.options[pureElement.selectedIndex].value;
  } else if (pureElement.tagName.toLowerCase() === "input" && (pureElement.type ?? "").toLowerCase() === "checkbox") {
    return pureElement.checked;
  } else {
    return pureElement.value;
  }
}

/**
 * Sets the "value" attribute of the given DOM element to the given value. 
 * 
 * Supports drop down (= "select") and checkbox. 
 * 
 * @param {HTMLElement} element A DOM element whose "value" attribute is to be set. 
 * @param {Any} value The value to set. 
 */
export function setElementValue(element, value) {
  const pureElement = unwrapJQueryElement(element);

  if (pureElement.tagName.toLowerCase() === "select") {
    setSelectedOptionByValue(pureElement, value);
  } else if (pureElement.tagName.toLowerCase() === "input" && (pureElement.type ?? "").toLowerCase() === "checkbox") {
    pureElement.checked = value;
  } else {
    pureElement.value = value;
  }
}

/**
 * Sets the option-element of the given select-element to be selected, 
 * whose value is equal to the given value. 
 * @param {JQuery} selectElement A HTML select-element. 
 * @param {Any} valueToSelect The value of the element to set as selected.
 */
export function setSelectedOptionByValue(selectElement, valueToSelect){
  const pureElement = unwrapJQueryElement(selectElement);
  try {
    const optionElements = pureElement.find('option');
    for(let i = 0; i < optionElements.length; i++) {
      const optionElement = optionElements[i];
      if (optionElement.value == valueToSelect) {
        pureElement.selectedIndex = i;
        break;
      }
    }
  } catch (error) {
    throw new Error("UnknownException: Failed to set the current drop-down option", { cause: error });
  }
}

/**
 * Enriches the given context object with basic contextual data. 
 * 
 * Adds the global 'game' object, as well as convenience flags like 'isOwner', 'isGM', 'isEditable' and 'isSendable'
 * @param {Object} context 
 */
export function enrichData(context) {
  // Add the game to the context object as a convenience property. 
  context.game = game;
  // In templates that implement it, this flag indicates whether the current user is the owner of the sheet. 
  context.isOwner = context.owner;
  // In templates that implement it, this flag indicates whether the current user is a GM. 
  context.isGM = game.user.isGM;
  // In templates that implement it, this flag determines whether data on the sheet can be edited. 
  context.isEditable = (context.isOwner || context.isGM) && context.editable;
  // In templates that implement it, this flag determines whether the sheet data can be sent to the chat. 
  context.isSendable = (context.isOwner || context.isGM);
}

/**
 * Un-wraps the given element, if it is currently JQuery-wrapped and returns it. 
 * 
 * @param {JQuery | HTMLElement} element The element to un-wrap. 
 * 
 * @returns {HTMLElement} The un-wrappped element
 */
function unwrapJQueryElement(element) {
  if (element[0] !== undefined) {
    return element[0];
  } else {
    return element;
  }
}