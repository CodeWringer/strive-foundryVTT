import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Own properties
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Object} target The target object to affect.  
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
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   * @param {Object} args.target The target object to affect.  
   * For example, could be an instance of {ActorSheet} or {ItemSheet}. 
   */
  constructor(args = {}) {
    super(args);
    this._target = args.target;
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

    // -------------------------------------------------------------
    if (!isOwner) return;
    // -------------------------------------------------------------
    if (!isEditable) return;

    this.element.click(this._onClick.bind(this));
  }

  /**
   * Callback function, which is invoked when the user clicks on the button. 
   * 
   * Must be overridden by inheriting types!
   * @abstract
   * @async
   */
  async callback() {
    throw new Error("NotImplementedException");
  }

  /**
   * @param event 
   * @private
   * @async
   */
  async _onClick(event) {
    // Invoke callback with event args and a reference to 'this' (= the view model). 
    await this.callback();
  }
}

Handlebars.registerPartial('_button', `{{#> "${ButtonViewModel.TEMPLATE}"}}{{> @partial-block }}{{/"${ButtonViewModel.TEMPLATE}"}}`);
