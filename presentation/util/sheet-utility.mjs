import { Rect } from "./rect.mjs";

/**
 * @constant
 */
export const SheetUtil = {
  /**
   * Returns the current value of the given DOM element. 
   * 
   * Supports drop down (= "select") and checkbox. 
   * 
   * @param {HTMLElement} element A DOM element. 
   * 
   * @returns {String} The value of the element. 
   */
  getElementValue: function(element) {
    const pureElement = this.unwrapJQueryElement(element);
  
    if (pureElement.tagName.toLowerCase() === "select") {
      return pureElement.options[pureElement.selectedIndex].value;
    } else if (pureElement.tagName.toLowerCase() === "input" && (pureElement.type ?? "").toLowerCase() === "checkbox") {
      return pureElement.checked;
    } else if (pureElement.tagName.toLowerCase() === "input" && (pureElement.type ?? "").toLowerCase() === "range") {
      return parseInt(pureElement.value);
    } else {
      return pureElement.value;
    }
  },
  
  /**
   * Sets the "value" attribute of the given DOM element to the given value. 
   * 
   * Supports drop down (= "select") and checkbox. 
   * 
   * @param {HTMLElement} element A DOM element whose "value" attribute is to be set. 
   * @param {Any} value The value to set. 
   */
  setElementValue: function(element, value) {
    const pureElement = this.unwrapJQueryElement(element);
  
    if (pureElement.tagName.toLowerCase() === "select") {
      this.setSelectedOptionByValue(pureElement, value);
    } else if (pureElement.tagName.toLowerCase() === "input" && (pureElement.type ?? "").toLowerCase() === "checkbox") {
      pureElement.checked = value;
    } else {
      pureElement.value = value;
    }
  },
  
  /**
   * Sets the option-element of the given select-element to be selected, 
   * whose value is equal to the given value. 
   * @param {JQuery} selectElement A HTML select-element. 
   * @param {Any} valueToSelect The value of the element to set as selected.
   */
  setSelectedOptionByValue: function(selectElement, valueToSelect){
    const pureElement = this.unwrapJQueryElement(selectElement);
  
    const jQueryElement = $(selectElement);
    const optionElements = jQueryElement.find('option');
    
    try {
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
  },
  
  /**
   * Un-wraps the given element, if it is currently JQuery-wrapped and returns it. 
   * 
   * @param {JQuery | HTMLElement} element The element to un-wrap. 
   * 
   * @returns {HTMLElement} The un-wrappped element
   */
  unwrapJQueryElement: function(element) {
    return $(element)[0];
  },

  /**
   * Returns the given element's rectangle. 
   * 
   * @returns {Rect}
   */
  getElementRect(element) {
    const parentPos = element.offset();
    return new Rect({
      x: parentPos.left,
      y: parentPos.top,
      width: element.outerWidth(),
      height: element.outerHeight(),
    });
  }
}
