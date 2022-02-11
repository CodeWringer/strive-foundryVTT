/**
 * Returns the current value of the given DOM element. 
 * 
 * Supports 'option' elements. 
 * @param element A DOM element. 
 * @returns {String} The value of the element. 
 */
export function getElementValue(element) {
  if (element.tagName.toLowerCase() === "select") {
    return element.options[element.selectedIndex].value;
  } else if (element.tagName.toLowerCase() === "input" && element.type === "checkbox") {
    return element.checked;
  } else {
    return element.value;
  }
}

/**
 * Sets the option-element of the given select-element to be selected, 
 * whose value is equal to the given value. 
 * @param selectElement A HTML select-element. 
 * @param valueToSelect The value of the element to set as selected.
 */
export function selectItemByValue(selectElement, valueToSelect){
  for(var i = 0; i < selectElement.options.length; i++) {
    if (selectElement.options[i].value === valueToSelect) {
      selectElement.selectedIndex = i;
      break;
    }
  }
}

/**
 * Returns an array of all input fields from the given DOM tree. 
 * @param {HTMLElement | JQuery} html 
 */
export function getAllInputs(html) {
  const cssClassEdits = "custom-system-edit";
  const cssClassReadOnlys = "custom-system-read-only";

  // TODO: This probably won't work with a HTMLElement. Make it work. 
  const edits = html.find(cssClassEdits);
  const readOnlys = html.find(cssClassReadOnlys);

  return edits.concat(readOnlys);
}

/**
 * Registers events on elements of the given DOM. 
 * @param {Object} html DOM of the sheet for which to register listeners. 
 * @param {DocumentSheet} ownerSheet The {DocumentSheet} whose rendered HTML is passed. 
 */
export function activateListeners(html, ownerSheet) {
  const isOwner = ownerSheet.actor.isOwner;
  const isEditable = ownerSheet.isEditable;
  const isSendable = isOwner;

  // Pull view models from global collection and hook up event listeners. 
  if (ownerSheet.viewModels !== undefined) {
    // Get all elements from the given DOM which have one of the following css classes: "custom-system-edit" or "custom-system-read-only"
    const inputs = SheetUtil.getAllInputs(html);
    for (const input of inputs) {
      const id = input.id;
      if (id === undefined) throw new Error("NullPointerException: id of input element mustn't be undefined!");

      // Remove from global collection and add to ownerSheet's collection. 
      const vm = ownerSheet.viewModels.pullFromGlobal(id);
      // Activate DOM event listeners of view model. 
      vm.activateListeners(html, ownerSheet, isOwner, isEditable, isSendable);
    }
  }
}