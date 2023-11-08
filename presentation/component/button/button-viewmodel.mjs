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
 * @property {String} id Unique ID of this view model instance. 
 * @property {Boolean} isEditable If true, is interactible. 
 * @property {JQuery | HTMLElement} element The DOM element that is 
 * associated with this view model. 
 * * Read-only
 * 
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * @property {String | undefined} localizedLabel A localized text to 
 * display as a button label. 
 * @property {String | undefined} iconHtml Raw HTML to render as 
 * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
 * @property {Boolean} showFancyFont If `true`, will render the `localizedLabel` 
 * using the "fancy font". 
 * 
 * @method onClick Asynchronous callback that is invoked when 
 * the button is clicked. Receives the button's original click-handler as its sole 
 * argument. In most cases, it should be called and `await`ed before one's own 
 * click handling logic. But in case the original logic is unwanted, the method 
 * can be ignored. 
 * * May return a value, if the inheriting type supports it. 
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
    Handlebars.registerPartial('button', `{{> "${ButtonViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * @param {Boolean | undefined} args.showFancyFont If `true`, will render 
   * the `localizedLabel` using the "fancy font". 
   * * default `false`
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Receives the button's original click-handler as its sole 
   * argument. In most cases, it should be called and `await`ed before one's own 
   * click handling logic. But in case the original logic is unwanted, the method 
   * can be ignored. 
   */
  constructor(args = {}) {
    super(args);

    this.localizedToolTip = args.localizedToolTip;
    this.localizedLabel = args.localizedLabel;
    this.iconHtml = args.iconHtml;
    this.onClick = args.onClick ?? (async (callback) => {
      await callback();
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.element.click(async () => {
      return await this.onClick(this._onClick.bind(this));
    });
  }

  /**
   * Internal asynchronous callback that is invoked upon click. 
   * 
   * Can return a value, if the button supports it. 
   * 
   * @returns {Any | undefined} 
   * 
   * @async
   * @virtual
   */
  async _onClick() {
    // Implementation up to ineriting types.
  }
}
