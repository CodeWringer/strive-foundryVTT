/**
 * Returns the current value of the given DOM element. 
 * 
 * Supports 'option' elements. 
 * @param element A DOM element. 
 * @returns {String} The value of the element. 
 */
export function getElementValue(element) {
  if (element.tagName.toLowerCase() == "select") {
    return element.options[element.selectedIndex].value;
  } else {
    return element.value;
  }
}