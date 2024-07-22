import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import ChoiceOption from "./choice-option.mjs";

/**
 * Represents the base type of choice inputs, such as a drop-down or radio-button-group. 
 * 
 * @extends InputViewModel
 * 
 * @property {ChoiceOption} value The current value. 
 * @property {Array<ChoiceOption>} options Gets the options available. 
 * * Read-only. 
 * @property {String} localizedValue The localized value of the current 
 * `ChoiceOption`. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {ChoiceOption}`
 * * `newValue: {ChoiceOption}`
 * 
 * @abstract
 */
export default class InputChoiceViewModel extends InputViewModel {
  /** @override */
  get localizedValue() { return (this.value ?? {}).localizedValue; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.iconHtml Raw HTML to render as 
   * an associated icon. E. g. `'<i class="fas fa-scroll"></i>'`
   * 
   * @param {ChoiceOption | undefined} args.value The current value. 
   * * default is the first option given.
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {ChoiceOption}`
   * * `newValue: {ChoiceOption}`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["options"]);

    this.options = args.options;
    this._value = args.value ?? (args.options.length > 0 ? args.options[0] : undefined);
  }
}