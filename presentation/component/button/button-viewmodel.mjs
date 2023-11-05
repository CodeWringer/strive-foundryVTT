import { isFunction } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * Constant that defines the css class to look for when identifying button elements. 
 * 
 * @constant
 */
export const SELECTOR_BUTTON = "custom-system-button";

/**
 * This is a basic implementation of a clickable button, that calls a given callback function 
 * when clicked. 
 * 
 * @extends ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Object | undefined} target The target object to affect.  
 * @property {Function} callback An asynchronous callback that is invoked upon completion of the 
 * button's own callback. 
 * @property {Any} callbackData Any data to pass to the completion callback. 
 * @property {Boolean} isEditable If true, is interactible. 
 * @property {String | undefined} localizableTitle The localizable title (tooltip). 
 * @property {String} localizedTitle The localized title (tooltip). 
 */
export default class ButtonViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('button', `{{#> "${ButtonViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {JQuery | HTMLElement}
   * @private
   */
  _element = undefined;
  /**
   * Returns the HTMLElement that is associated with this view model. 
   * @type {JQuery | HTMLElement}
   * @readonly
   */
  get element() { return this._element; }

  /**
   * @type {Object | undefined}
   * @private
   */
  _target = undefined;
  /**
   * @type {Object | undefined}
   * @readonly
   */
  get target() { return this._target; }

  /**
   * Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @type {Function}
   */
  callback = undefined;

  /**
   * Returns data to pass to the callback function, if one is defined. 
   * 
   * This getter is to be overridden by inheriting types! 
   * 
   * @type {Any | undefined}
   * @default undefined
   * 
   * @protected
   * @virtual
   * @readonly
   */
  get callbackData() { return undefined; }

  /**
   * The localizable title (tooltip). 
   * @type {String | undefined}
   */
  localizableTitle = undefined;

  /**
   * The localized title (tooltip). 
   * @type {String}
   * @readonly
   */
  get localizedTitle() { return this.localizableTitle !== undefined ? game.i18n.localize(this.localizableTitle) : ""; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {Object | undefined} args.target Optional. The target object to affect.  
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   * @param {Function | undefined} args.onClick Optional. The function to call on click. 
   */
  constructor(args = {}) {
    super(args);

    this._target = args.target;
    this.callback = this._getCallback(args.callback).bind(this._target);
    this.isEditable = args.isEditable ?? false;
    this.localizableTitle = args.localizableTitle;
    if (args.onClick !== undefined) {
      this.onClick = args.onClick;
    }
  }

  /**
   * @param {Function | String | undefined} callback 
   * @private
   * @returns {Function}
   * @throws {Error} Thrown, on an invalid callback value, e. g. `null`. 
   */
  _getCallback(callback) {
    if (typeof(callback) === "string") {
      return this.target[callback];
    } else if (callback === undefined) {
      return (async (args) => {});
    } else if (isFunction(callback)) {
      return callback;
    } else {
      throw new Error("Invalid callback");
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
    
    this._element = html.find(`.${SELECTOR_BUTTON}#${this.id}`);
    
    if (this._element === undefined || this._element === null || this._element.length === 0) {
      throw new Error(`NullPointerException: Failed to get input element with id '${this.id}'`);
    }

    this.element.click(this._onClick.bind(this, html, this.isOwner, this.isEditable));
  }

  /**
   * Callback function, which is invoked when the user clicks on the button. 
   * 
   * Must be overridden by inheriting types!
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * @param {Boolean} isOwner If true, registers events that require owner permission. 
   * @param {Boolean} isEditable If true, registers events that require editing permission. 
   * @abstract
   * @async
   */
  async onClick(html, isOwner, isEditable) {
    throw new Error("NotImplementedException");
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onClick(html, isOwner, isEditable, event) {
    event.preventDefault();

    if (this.isEditable !== true) return;

    await this.onClick(html, isOwner, isEditable);
    if (this.callback !== undefined && this.callback !== null) {
      await this.callback(this.callbackData);
    }
  }
}
