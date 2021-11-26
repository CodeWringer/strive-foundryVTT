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