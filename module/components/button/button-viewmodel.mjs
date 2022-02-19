import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Own properties
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Object} target The target object to affect.  
 * @property {Function} callback An asynchronous callback that is invoked upon completion of the button's own callback. 
 * @property {Any} callbackData Any data to pass to the completion callback. 
 */
export default class ButtonViewModel extends ViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON; }

  /**
   * Constant that defines the css class to look for when identifying button elements. 
   * @static
   * @readonly
   */
  static SELECTOR_BUTTON = "custom-system-button";

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
   * @type {Object}
   * @private
   */
  _target = undefined;
  /**
   * @type {Object}
   * @readonly
   */
  get target() { return this._target; }

  /**
   * Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @type {Function}
   */
  callback = undefined;

  /**
   * @type {Any}
   * @private
   */
  _callbackData = undefined;
  /**
   * Defines any data to pass to the completion callback. 
   * @type {Any}
   * @readonly
   */
  get completionCallbackData() { return this._callbackData; }

  /**
   * @param {String | undefined} args.id
   * 
   * @param {Object} args.target The target object to affect.  
   * For example, could be an instance of {ActorSheet} or {ItemSheet}. 
   * @param {Function | String | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any} args.callbackData Defines any data to pass to the completion callback. 
   */
  constructor(args = {}) {
    super(args);
    this._target = args.target;
    this.callback = this._getCallback(args.callback);
    this._callbackData = args.callbackData;
  }

  /**
   * @param {Function | String | undefined} callback 
   * @private
   * @returns {Function}
   */
  _getCallback(callback) {
    if (typeof(callback) === "string") {
      return this.target[callback];
    } else if (callback === undefined) {
      return (async (args) => {});
    } else {
      return callback;
    }
  }

  /**
   * Registers events on elements of the given DOM. 
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * @param {Boolean} isOwner If true, registers events that require owner permission. 
   * @param {Boolean} isEditable If true, registers events that require editing permission. 
   * @throws {Error} NullPointerException Thrown if the input element could not be found. 
   */
  activateListeners(html, isOwner, isEditable) {
    this._element = html.find(`.${ButtonViewModel.SELECTOR_BUTTON}#${this.id}`);
    
    if (this._element === undefined || this._element === null) {
      throw new Error(`NullPointerException: Failed to get input element with id '${this.id}'`);
    }

    this.element.click(this._onClick.bind(this, html, isOwner, isEditable));
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

    await this.onClick(html, isOwner, isEditable);
    await this.callback(this._callbackData);
  }
}

Handlebars.registerPartial('_button', `{{#> "${ButtonViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonViewModel.TEMPLATE}"}}`);
