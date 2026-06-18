import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
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
 * @property {String} id Unique ID of this view model instance. 
 * @property {Boolean} isEditable If true, is interactible. 
 * @property {JQuery | HTMLElement} element The DOM element that is 
 * associated with this view model. 
 * * Read-only
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * 
 * @property {String | undefined} content Raw HTML to render as the content 
 * of the button. 
 * 
 * @method onClick Asynchronous callback that is invoked when 
 * the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: any | undefined` - Returned data of the click callback, if 
 * there is any. 
 */
export default class ButtonViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_BUTTON; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('button', `{{> "${ButtonViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.content Raw HTML to render as the content 
   * of the button. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: any | undefined` - Returned data of the click callback, if 
   * there is any. 
   */
  constructor(args = {}) {
    super(args);

    if (ValidationUtil.isDefined(args.localizedLabel)) {
      game.strive.logger.logWarn("Deprecated parameter, 'localizedLabel', use 'content', instead");
    }
    if (ValidationUtil.isDefined(args.iconHtml)) {
      game.strive.logger.logWarn("Deprecated parameter, 'iconHtml', use 'content', instead");
    }
    
    this.content = args.content;

    this.onClick = args.onClick ?? (async (event, data) => {});
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.element.click(async (event) => {
      event.preventDefault(); // Prevents side-effects from event-bubbling. 

      if (this.isEditable === true) {
        const data = await this._onClick(event);
        await this.onClick(event, data);
      }
    });
  }

  /**
   * Internal click callback for use in inheriting types. 
   * 
   * @param {Event} event 
   * 
   * @returns {any | undefined} A value, if the inheriting type's implementation 
   * returns one. 
   * 
   * @async
   * @protected
   * @virtual
   */
  async _onClick(event) {
    // Implementation up to inheriting types. 
  }
}
