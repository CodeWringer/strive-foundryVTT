import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";

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
 * @property {String | undefined} content Raw HTML to render as the content 
 * of the button. 
 * 
 * @method onClick Asynchronous callback that is invoked when 
 * the button is clicked. Arguments: 
 * * `event: Event`
 */
export default class ButtonViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.button; }

  /** @override */
  get clazz() { return ButtonViewModel; }

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
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {String | undefined} args.content Raw HTML to render as the content 
   * of the button. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when 
   * the button is clicked. Arguments: 
   * * `event: Event`
   */
  constructor(args = {}) {
    super(args);

    this.content = args.content;
    this.onClick = args.onClick ?? (() => { });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.element.click(async (event) => {
      event.preventDefault(); // Prevents side-effects from event-bubbling. 

      if (this.isEditable === true) {
        this._onClick(event);
      }
    });
    this.element.on("keydown", async (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (this.isEditable === true) {
          this._onClick(event);
        }
      }
    });
  }

  /**
   * Internal click handler. 
   * @param {Event} event 
   * @protected
   */
  _onClick(event) {
    this.onClick(event);
  }
}
