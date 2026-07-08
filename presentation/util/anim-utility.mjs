import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import { SheetUtil } from "./sheet-utility.mjs";

export const AnimationUtil = {
  /**
   * @type {Map<String, Number>}
   * @private
   */
  _timeouts: new Map(),

  /**
   * @type {String}
   * @private
   */
  _containerElementString: '<div class="strive flex flex-middle"></div>',

  /**
   * @param {Object} args
   * Displaces the `exitingElements` with the given `enteringElements` with a sliding animation. 
   * @param {Array<JQuery | HTMLElement>} args.enteringElements The elements that are 
   * to slide into view. 
   * @param {Array<JQuery | HTMLElement>} args.exitingElements The elements that are 
   * to be displaced and slide out of view. 
   * @param {JQuery | HTMLElement | undefined} args.containerElement 
   * @param {Boolean | undefined} args.containerFlexGrow If `true`, and `containerElement` 
   * is `null` or `undefined`, then the temporarily added wrapper container will receive 
   * the flex-grow class. 
   * * default `false`
   * @returns {Promise<void>}
   * @async
   */
  slideDisplace: async (args = {}) => {
    let containerElement = args.containerElement;
    const isUserDefinedContainer = ValidationUtil.isDefined(containerElement);

    if (!isUserDefinedContainer) {
      const firstElement = args.enteringElements.length > 0 ? args.enteringElements[0] : args.exitingElements[0];
      $(AnimationUtil._containerElementString).insertBefore(firstElement);
      containerElement = firstElement.prev();
      if (args.containerFlexGrow === true) {
        $(containerElement).addClass("flex-grow");
      }
    }

    const idToClear = AnimationUtil._timeouts.get(containerElement);
    clearTimeout(idToClear);

    for (const enteringElement of args.enteringElements) {
      $(enteringElement).addClass("enter");
      $(enteringElement).removeClass("hidden");

      if (!isUserDefinedContainer) {
        $(enteringElement).detach();
        $(containerElement).append(enteringElement);
      }
    }

    for (const exitingElement of args.exitingElements) {
      $(exitingElement).addClass("exit");

      if (!isUserDefinedContainer) {
        $(exitingElement).detach();
        $(containerElement).append(exitingElement);
      }
    }

    $(containerElement).addClass("slide-anim");

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        for (const enteringElement of args.enteringElements) {
          $(enteringElement).removeClass("enter");
  
          if (!isUserDefinedContainer) {
            $(enteringElement).detach();
            $(enteringElement).insertBefore(containerElement);
          }
        }
  
        for (const exitingElement of args.exitingElements) {
          $(exitingElement).removeClass("exit");
          $(exitingElement).addClass("hidden");
  
          if (!isUserDefinedContainer) {
            $(exitingElement).detach();
            $(exitingElement).insertBefore(containerElement);
          }
        }
  
        $(containerElement).removeClass("slide-anim");
        if (!isUserDefinedContainer) {
          $(containerElement).remove();
        }
  
        AnimationUtil._timeouts.delete(containerElement);
        resolve();
      }, 500);
      AnimationUtil._timeouts.set(containerElement, timeoutId);
    });
  },

  /**
   * @param {Object} args
   * Slides the given `elements` out of view, hiding them. 
   * @param {Array<JQuery | HTMLElement>} args.elements The elements that are 
   * to slide out of view. 
   * @param {JQuery | HTMLElement | undefined} args.containerElement 
   * @param {Boolean | undefined} args.containerFlexGrow If `true`, and `containerElement` 
   * is `null` or `undefined`, then the temporarily added wrapper container will receive 
   * the flex-grow class. 
   * * default `false`
   * @returns {Promise<void>}
   * @async
   */
  slideOut: async (args = {}) => {
    let containerElement = args.containerElement;
    const isUserDefinedContainer = ValidationUtil.isDefined(containerElement);

    if (!isUserDefinedContainer) {
      const firstElement = args.elements[0];
      $(AnimationUtil._containerElementString).insertBefore(firstElement);
      containerElement = firstElement.prev();
      if (args.containerFlexGrow === true) {
        $(containerElement).addClass("flex-grow");
      }
    }

    const idToClear = AnimationUtil._timeouts.get(containerElement);
    clearTimeout(idToClear);

    for (const element of args.elements) {
      $(element).addClass("exit");

      const elementRect = SheetUtil.getElementRect(element);

      if (!isUserDefinedContainer) {
        $(element).detach();
        $(containerElement).append(element);
      }

      // This ensures the layout remains the same until the element has finished sliding out. 
      // Otherwise, the element won't be visible. 
      $(`<div style="width: ${elementRect.width}px; height: ${elementRect.height}px;"></div>`).insertBefore(element);
    }

    $(containerElement).addClass("slide-anim");

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        for (const element of args.elements) {
          $(element).addClass("hidden");
          $(element).removeClass("exit");
  
          if (!isUserDefinedContainer) {
            $(element).detach();
            $(element).insertBefore(containerElement);
          }
        }
  
        $(containerElement).removeClass("slide-anim");
        if (!isUserDefinedContainer) {
          $(containerElement).remove();
        }
  
        AnimationUtil._timeouts.delete(containerElement);
        resolve();
      }, 500);
      AnimationUtil._timeouts.set(containerElement, timeoutId);
    });
  },

  /**
   * @param {Object} args
   * Slides the given `elements` into view. 
   * @param {Array<JQuery | HTMLElement>} args.elements The elements that are 
   * to slide into view. 
   * @param {JQuery | HTMLElement | undefined} args.containerElement 
   * @param {Boolean | undefined} args.containerFlexGrow If `true`, and `containerElement` 
   * is `null` or `undefined`, then the temporarily added wrapper container will receive 
   * the flex-grow class. 
   * * default `false`
   * @returns {Promise<void>}
   * @async
   */
  slideIn: async (args = {}) => {
    let containerElement = args.containerElement;
    const isUserDefinedContainer = ValidationUtil.isDefined(containerElement);

    if (!isUserDefinedContainer) {
      const firstElement = args.elements[0];
      $(AnimationUtil._containerElementString).insertBefore(firstElement);
      containerElement = firstElement.prev();
      if (args.containerFlexGrow === true) {
        $(containerElement).addClass("flex-grow");
      }
    }

    const idToClear = AnimationUtil._timeouts.get(containerElement);
    clearTimeout(idToClear);

    for (const element of args.elements) {
      $(element).addClass("enter");
      $(element).removeClass("hidden");

      if (!isUserDefinedContainer) {
        $(element).detach();
        $(containerElement).append(element);
      }
    }

    $(containerElement).addClass("slide-anim");

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        for (const element of args.elements) {
          $(element).removeClass("enter");
  
          if (!isUserDefinedContainer) {
            $(element).detach();
            $(element).insertBefore(containerElement);
          }
        }
  
        $(containerElement).removeClass("slide-anim");
        if (!isUserDefinedContainer) {
          $(containerElement).remove();
        }
  
        AnimationUtil._timeouts.delete(containerElement);
        resolve();
      }, 500);
      AnimationUtil._timeouts.set(containerElement, timeoutId);
    });
  },
};
