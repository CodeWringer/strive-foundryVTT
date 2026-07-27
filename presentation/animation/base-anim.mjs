import { UuidUtil } from "../../common/util/uuid-utility.mjs";
import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import { SheetUtil } from "../util/sheet-utility.mjs";

/**
 * Defines the basic contract and structure of an animation. 
 * 
 * Animations are handled as fire-and-forget objects, which do their job, 
 * and then disappear. Do NOT re-use them! 
 * 
 * @abstract Inheritors MUST implement:
 * * `_execute()`
 * 
 * Inheritors _may_ override:
 * * `_complete()`
 * * `_setup()`
 * * `_tearDown()`
 * 
 * Inheritors should NOT override:
 * * `execute()`
 * 
 * @property {String} id
 * @property {Array<JQuery | HTMLElement>} elements
 * @property {Boolean} isCanceled If `true`, the animation has been canceled. 
 * This is a one-way street and irreversible. 
 * * read-only
 * @property {Boolean} isCompleted If `true`, the animation has been finished. 
 * * read-only
 */
export default class BaseAnimation {
  /**
   * @type {String}
   * @private
   */
  #id = false;
  /**
   * @type {String}
   * @readonly
   */
  get id() { return this.#id; }

  /**
   * @type {Boolean}
   * @private
   */
  #isCanceled = false;
  /**
   * If `true`, the animation has been canceled. This is a one-way street 
   * and irreversible. 
   * @type {Boolean}
   * @readonly
   */
  get isCanceled() { return this.#isCanceled; }

  /**
   * @type {Boolean}
   * @private
   */
  #isCompleted = false;
  /**
   * If `true`, the animation has been finished. 
   * @type {Boolean}
   * @readonly
   */
  get isCompleted() { return this.#isCompleted; }

  /**
   * @type {Array<JQuery | HTMLElement>}
   * @private
   */
  #elements = false;
  /**
   * @type {Array<JQuery | HTMLElement>}
   * @readonly
   */
  get elements() { return this.#elements; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id 
   * @param {Array<JQuery | HTMLElement> | undefined} args.elements 
   */
  constructor(args = {}) {
    this.#id = args.id ?? UuidUtil.createUUID();
    this.#elements = args.elements ?? [];
  }

  /**
   * Cancels the current animation as-is. 
   * 
   * Does not restore the original state of any DOM elements. 
   * The caller will have to take care of DOM restoration. 
   */
  cancel() {
    this.#isCanceled = true;
    if (ValidationUtil.isDefined(this._container)) {
      this._container.addClass("hidden");
    }
  }

  /**
   * Performs the animation. The returned `Promise` is `await`able and will 
   * complete when the animation does. 
   * @returns {Promise<Any>} A Promise invoked upon completion. 
   * @throws When invoked again despite the animation having been finished 
   * already. 
   */
  execute() {
    if (this.#isCompleted) {
      throw new Error("Animation finished already and cannot be executed again");
    }
    this.#cancelConflictingAnims();
    game.strive.activeAnims.push(this);
    return new Promise(async (resolve, reject) => {
      this._setup(this.elements);

      await this._execute();

      this._tearDown();

      if (!this.isCanceled) {
        this._complete();
      }
      resolve();
      this.#isCompleted = true;
      const thisIndex = game.strive.activeAnims.indexOf(this);
      game.strive.activeAnims.splice(thisIndex, 1);
    });
  }

  /**
   * Performs the actual animation. Do not worry about set-up or tear down in here. 
   * 
   * Make sure to `await` the completion of the animation before returning! 
   * If it is handled with CSS, its completion can only be guesstimated. 
   * For example with:
   * ```JS
   * await new Promise(resolve => setTimeout(resolve, 500));
   * ```
   * @protected
   * @abstract
   * @async
   */
  async _execute() {
    throw new Error("Not implemented");
  }
  
  /**
   * Invoked upon normal completion of the animation. DOM cleanup may be performed 
   * in here or ensuring the final DOM state is as desired. 
   * @protected
   * @virtual
   */
  _complete() {}

  /**
   * Cancels ALL other active animations which target any one of the elements 
   * this animation also targets. 
   * @private
   */
  #cancelConflictingAnims() {
    for (const anim of game.strive.activeAnims) {
      for (const element of this.elements) {
        if (anim.#hasElement(element)) {
          anim.cancel();
          break;
        }
      }
    }
  }

  /**
   * Returns `true`, if the given element is targeted by this animation. 
   * @param {JQuery | HTMLElement} element The element to test. 
   * @returns {Boolean} `true`, if the given element is targeted by this animation. 
   * @private
   */
  #hasElement(element) {
    const nonJqueryElm = ValidationUtil.isDefined(element.length) ? element[0] : element;
    for (const element of this.elements) {
      const nonJqueryThisElm = ValidationUtil.isDefined(element.length) ? element[0] : element;
      if (nonJqueryElm == nonJqueryThisElm) {
        return true;
      }
    }
    return false;
  }

  /**
   * Creates the container and clones which will be used for the animation. 
   * @param {Array<JQuery | HTMLElement>} elements The original elements 
   * upon which the animation is to be executed.
   * @protected
   * @virtual
   */
  _setup(elements) {
    if (ValidationUtil.isDefined(this._container)) return;

    const firstElement = elements[0];

    let width = 0;
    let height = 0;
    for (const element of this.elements) {
      $(element).removeClass("hidden");
      const rect = SheetUtil.getElementRect(element);
      
      if (rect.width > width) {
        width = rect.width;
      }
      if (rect.height > height) {
        height = rect.height;
      }

      $(element).addClass("hidden");
    }
    let style = `width: ${width}px; height: ${height}px;`;
    const str = `<div id="anim-${this.id}" class="strive slide-anim" style="${style}"></div>`;
    $(str).insertBefore(firstElement);
    this._container = $(`div#anim-${this.id}`);

    this._elements = [];
    for (const element of elements) {
      $(element).addClass("hidden");
      const clone = $(element).clone();
      clone.appendTo(this._container);
      this._elements.push(clone);
    }
  }

  /**
   * Removes the temporary container, thus cleaning the DOM of the animation. 
   * @protected
   * @virtual
   */
  _tearDown() {
    if (!ValidationUtil.isDefined(this._container)) return;

    this._container.remove();
    this._container = null;
  }
}