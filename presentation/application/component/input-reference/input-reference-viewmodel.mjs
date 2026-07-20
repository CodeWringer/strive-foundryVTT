import Reference from "../../../../business/model/domain/reference.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * @extends InputViewModel
 */
export default class InputReferenceViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.reference; }

  /** @override */
  get clazz() { return InputReferenceViewModel; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputReference', `{{> "${InputReferenceViewModel.TEMPLATE}"}}`);
  }

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #menuElement = undefined;

  /**
   * Initialized late - in `activateListeners`!
   * @type {JQuery}
   * @readonly
   * @private
   */
  #inputElement = undefined;

  /**
   * @type {Boolean}
   * @private
   */
  #isMenuOpen = false;

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   * @param {Function | undefined} args.onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocus Callback that is invoked when the input element is focused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * @param {Function | undefined} args.onFocusLost Callback that is invoked when the input element is unfocused. 
   * * `event: {Event}`
   * * `viewModel: {ViewModel}`
   * 
   * @param {Reference} args.value
   * 
   */
  constructor(args = {}) {
    super(args);
  }


  /**
   * @override
   * 
   * @throws {Error} UnknownException Thrown if the current option could not be set correctly. 
   */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.#menuElement = $(this.element).find(`menu#${this.id}-menu`);
    this.#inputElement = $(this.element).find("input");

  }
}
