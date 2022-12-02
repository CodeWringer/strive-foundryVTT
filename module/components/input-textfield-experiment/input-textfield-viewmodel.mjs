import { TEMPLATES } from "../../templatePreloader.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";
import InputViewModel from "../input-viewmodel.mjs";
import ViewModelTypeDefinition from "../../view-model/view-model-type-definition.mjs";
import { VIEW_MODEL_TYPE } from "../../view-model/view-model-type.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from InputViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * 
 * --- Own properties
 * 
 * @property {String} placeholder Gets a placeholder text to display while the textfield is empty. 
 */
export default class InputTextFieldExperimentViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_TEXTFIELD_EXPERIMENT; }

  /**
   * @type {String | undefined}
   * @readonly
   */
  placeholder = undefined;

  /**
   * Returns the localized placeholder. 
   * @type {String | undefined}
   * @readonly
   */
  get localizedPlaceholder() { return this._placeholder !== undefined ? game.i18n.localize(this.placeholder) : undefined; }
  
  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizableTitle Optional. The localized title (tooltip). 
   * 
   * @param {String} args.placeholder Optional. A placeholder text to display while the textfield is empty. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);

    this.placeholder = args.placeholder;
    this.localizableTitle = args.localizableTitle;
  }
}

Handlebars.registerPartial('inputTextFieldExperiment', `{{> "${InputTextFieldExperimentViewModel.TEMPLATE}"}}`);

VIEW_MODEL_TYPE.set(
  "InputTextFieldExperimentViewModel", 
  new ViewModelTypeDefinition(
    (args) => { return new InputTextFieldExperimentViewModel(args); },
    ["propertyOwner", "propertyPath", "localizableTitle"]
  )
);
