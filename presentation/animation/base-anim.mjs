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
 */
export default class BaseAnimation {
  /**
   * @type {Boolean}
   * @private
   */
  #isCanceled = false;
  /**
   * If `true`, the animation has been canceled. This is a one-way street 
   * and irreversible. 
   * @type {Boolean}
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
   */
  get isCompleted() { return this.#isCompleted; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id 
   * @param {Array<JQuery | HTMLElement> | undefined} args.elements 
   */
  constructor(args = {}) {
    this.id = args.id ?? UuidUtil.createUUID();
    this.elements = args.elements ?? [];
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
    return new Promise(async (resolve, reject) => {
      this._setup(this.elements);

      await this._execute();

      this._tearDown();

      if (this.isCanceled) {
        reject();
      } else {
        this._complete();
        resolve();
      }
      this.#isCompleted = true;
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
   * Creates the container and clones which will be used for the animation. 
   * @param {Array<JQuery | HTMLElement>} elements The original elements 
   * upon which the animation is to be executed.
   * @protected
   * @virtual
   */
  _setup(elements) {
    if (ValidationUtil.isDefined(this._container)) return;

    const firstElement = elements[0];

    let style = "";
    const str = `<div id="anim-${this.id}" class="strive flex flex-row flex-middle slide-anim" style="${style}"></div>`;
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