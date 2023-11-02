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
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * @property {String | undefined} localizedText A localized text to 
 * display as a button label. 
 * @property {String | undefined} iconHtml Raw HTML to render as 
 * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
 * @property {Boolean} showFancyFont If `true`, will render the `localizedText` 
 * using the "fancy font". 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Receives no arguments. 
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
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @property {String | undefined} args.localizedText A localized text to 
   * display as a button label. 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * @param {Boolean | undefined} args.showFancyFont If `true`, will render 
   * the `localizedText` using the "fancy font". 
   * * default `false`
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Receives no arguments. 
   */
  constructor(args = {}) {
    super(args);

    this.localizedToolTip = args.localizedToolTip;
    this.localizedText = args.localizedText;
    this.iconHtml = args.iconHtml;
    this.showFancyFont = args.showFancyFont ?? false;
    this.onClick = args.onClick ?? (async () => {});
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
    
    this._element = html.find(`.${SELECTOR_BUTTON}#${this.id}`);
    
    if (this._element === undefined || this._element === null || this._element.length === 0) {
      throw new Error(`NullPointerException: Failed to get input element with id '${this.id}'`);
    }

    this.element.click(async (event) => {
      // Prevent underlying elements on the DOM from *also* reacting to the click. 
      event.preventDefault();

      if (this.isEditable !== true) return;

      await this.onClick();
    });
  }
}
