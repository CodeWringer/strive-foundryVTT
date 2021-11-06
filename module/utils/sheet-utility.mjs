/**
 * Returns the current value of the given DOM element. 
 * 
 * Supports 'option' elements. 
 * @param element A DOM element. 
 * @returns {String} The value of the element. 
 */
export function getElementValue(element) {
    let newValue = element.value;
    if (element.tagName.toLowerCase() == "select") {
      const optionValue = element.options[element.selectedIndex].value;
      newValue = optionValue;
    }
    return newValue;
}