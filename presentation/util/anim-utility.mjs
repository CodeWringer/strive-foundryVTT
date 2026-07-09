import { UuidUtil } from "../../common/util/uuid-utility.mjs";
import { ValidationUtil } from "../../common/util/validation-utility.mjs";

export const AnimationUtil = {
  /**
   * @type {Array<ActiveAnimation>}
   * @private
   */
  _activeAnimations: [],

  /**
   * @param {Object} args
   * Displaces the `exitingElements` with the given `enteringElements` with a sliding animation. 
   * @param {Array<JQuery | HTMLElement>} args.enteringElements The elements that are 
   * to slide into view. 
   * @param {Array<JQuery | HTMLElement>} args.exitingElements The elements that are 
   * to be displaced and slide out of view. 
   * @returns {Promise<void>}
   * @async
   */
  slideDisplace: async (args = {}) => {
    const allElements = args.enteringElements.concat(args.exitingElements);
    if (allElements.length == 0 || allElements[0].length == 0) return;
    AnimationUtil._clearConflicts(allElements);

    const id = UuidUtil.createUUID();

    for (const element of args.enteringElements) {
      $(element).addClass("enter");
      $(element).removeClass("hidden");
      $(element).parent().addClass("slide-anim");
    }

    for (const element of args.exitingElements) {
      $(element).removeClass("hidden");
      $(element).addClass("exit");
      $(element).parent().addClass("slide-anim");
    }

    const _reset = () => {
      for (const element of args.enteringElements) {
        $(element).removeClass("enter");
        $(element).parent().removeClass("slide-anim");
      }

      for (const element of args.exitingElements) {
        $(element).removeClass("exit");
        $(element).addClass("hidden");
        $(element).parent().removeClass("slide-anim");
      }
    };

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        AnimationUtil._removeAnimById(id);
        resolve();
      }, 500);
      AnimationUtil._activeAnimations.push(new ActiveAnimation({
        elements: allElements,
        reset: _reset,
        timeoutId: timeoutId,
        id: id,
        resolve: resolve,
      }));
    });
  },

  /**
   * @param {Object} args
   * Slides the given `elements` out of view, hiding them. 
   * @param {Array<JQuery | HTMLElement>} args.elements The elements that are 
   * to slide out of view. 
   * @returns {Promise<void>}
   * @async
   */
  slideOut: async (args = {}) => {
    if (args.elements.length == 0 || args.elements[0].length == 0) return;
    AnimationUtil._clearConflicts(args.elements);

    const id = UuidUtil.createUUID();

    for (const element of args.elements) {
      $(element).removeClass("hidden");
      $(element).addClass("exit");
      $(element).parent().addClass("slide-anim");
    }

    const _reset = () => {
      for (const element of args.elements) {
        $(element).removeClass("exit");
        $(element).addClass("hidden");
        $(element).parent().removeClass("slide-anim");
      }
    };

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        AnimationUtil._removeAnimById(id);
        resolve();
      }, 500);
      AnimationUtil._activeAnimations.push(new ActiveAnimation({
        elements: args.elements,
        reset: _reset,
        timeoutId: timeoutId,
        id: id,
        resolve: resolve,
      }));
    });
  },

  /**
   * @param {Object} args
   * Slides the given `elements` into view. 
   * @param {Array<JQuery | HTMLElement>} args.elements The elements that are 
   * to slide into view. 
   * @returns {Promise<void>}
   * @async
   */
  slideIn: async (args = {}) => {
    if (args.elements.length == 0 || args.elements[0].length == 0) return;
    AnimationUtil._clearConflicts(args.elements);

    const id = UuidUtil.createUUID();

    for (const element of args.elements) {
      $(element).addClass("enter");
      $(element).removeClass("hidden");
      $(element).parent().addClass("slide-anim");
    }

    const _reset = () => {
      for (const element of args.elements) {
        $(element).removeClass("enter");
        $(element).parent().removeClass("slide-anim");
      }
    };

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        AnimationUtil._removeAnimById(id);
        resolve();
      }, 500);
      AnimationUtil._activeAnimations.push(new ActiveAnimation({
        elements: args.elements,
        reset: _reset,
        timeoutId: timeoutId,
        id: id,
        resolve: resolve,
      }));
    });
  },

  /**
   * @param {Array<JQuery | HTMLElement>} elements 
   * @private
   */
  _clearConflicts(elements) {
    const animsToKill = AnimationUtil._activeAnimations.filter((anim) => {
      for (const element of elements) {
        if (anim.elements.find(it => it == element)) {
          return true;
        }
      }
      return false;
    });

    for (const animToKill of animsToKill) {
      AnimationUtil._removeAnimById(animToKill.id);
    }
  },

  /**
   * @param {String} id 
   * @private
   */
  _removeAnimById(id) {
    const animToKill = AnimationUtil._activeAnimations.find(it => it.id === id);
    if (!ValidationUtil.isDefined(animToKill)) return;

    clearTimeout(animToKill.timeoutId);
    animToKill.reset();
    const index = AnimationUtil._activeAnimations.findIndex(it => it.id === id);
    if (index >= 0) {
      AnimationUtil._activeAnimations.splice(index, 1);
    }
    animToKill.resolve();
  }
};

export class ActiveAnimation {
  /**
   * @param {Object} args
   * @param {Array<JQuery | HTMLElement>} args.elements
   * @param {Function} args.reset
   * @param {String} args.timeoutId
   * @param {Function} args.resolve
   * @param {String | undefined} args.id
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["elements", "reset", "timeoutId", "resolve"]);
    this.elements = args.elements;
    this.reset = args.reset;
    this.timeoutId = args.timeoutId;
    this.resolve = args.resolve;
    this.id = args.id ?? UuidUtil.createUUID();
  }
}
