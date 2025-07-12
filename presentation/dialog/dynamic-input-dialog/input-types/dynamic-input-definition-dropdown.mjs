import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import DynamicInputDefinition from "./dynamic-input-definition.mjs";
import { DYNAMIC_INPUT_TYPES } from "./dynamic-input-types.mjs";

/**
 * A drop-down that allows picking a single item from a list. 
 * 
 * For use in a `DynamicInputDialog`. 
 * 
 * @property {DYNAMIC_INPUT_TYPES} type Returns `DYNAMIC_INPUT_TYPES.DROP_DOWN`. 
 * @property {String} name Internal name. The value of the input will be referencable 
 * by this name. 
 * @property {String | undefined} localizedLabel Localized companion label. 
 * @property {String | undefined} iconHtml E. g. `'<i class="fas fa-plus"></i>'`
 * @property {Boolean} required If true, the represented input must have a valid 
 * input, to allow dialog confirmation. 
 * @property {Boolean} isEditable If true, enables the control. If false, renders 
 * it in read-only mode. 
 * @property {ChoiceOption | undefined} defaultValue A default value to initialize the 
 * input control with. 
 * @property {Boolean} showFancyFont If true, will render labels using the fancy font. 
 * @property {Function | undefined} validationFunc A validation function. 
 * * Receives the current value of the control as its input and must return a boolean 
 * value. `true` signalizes a successful validation without errors, while `false` 
 * indicates validation failed. 
 * 
 * @property {Array<ChoiceOption>} options The options available to the drop-down. 
 * 
 * @method onChange Async callback that is invoked when the 
 * value changes. Arguments:
 * * `oldValue: ChoiceOption`
 * * `newValue: ChoiceOption`
 * * `dialogViewModel: DynamicInputDialogViewModel`
 * 
 * @extends DynamicInputDefinition
 */
export default class DynamicInputDefinitionDropdown extends DynamicInputDefinition {
  /**
   * @param {Object} args 
   * @param {String} args.name Internal name. The value of the input will be referencable 
   * by this name. 
   * @param {String | undefined} args.localizedLabel Localized companion label. 
   * * default `""`
   * @param {String | undefined} args.iconHtml E. g. `'<i class="fas fa-plus"></i>'`
   * @param {Boolean | undefined} args.required If true, the represented input must have a valid 
   * input, to allow dialog confirmation. 
   * * Default `false`. 
   * @param {Boolean | undefined} args.isEditable If true, enables the control. If false, renders 
   * it in read-only mode. 
   * * Default `true`. 
   * @param {ChoiceOption | undefined} args.defaultValue A default value to initialize the 
   * input control with. 
   * @param {Function | undefined} args.validationFunc A validation function. 
   * * Receives the current value of the control as its input and must return a boolean 
   * value. `true` signalizes a successful validation without errors, while `false` 
   * indicates validation failed. 
   * @param {Boolean | undefined} args.showFancyFont If true, will render labels using the 
   * fancy font. 
   * * Default `false`
   * @param {Function | undefined} args.onChange Async callback that is invoked when the 
   * value changes. Arguments:
   * * `oldValue: ChoiceOption`
   * * `newValue: ChoiceOption`
   * * `dialogViewModel: DynamicInputDialogViewModel`
   * 
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   */
  constructor(args = {}) {
    super({
      ...args,
      type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
    });
    ValidationUtil.validateOrThrow(args, ["options"]);
    
    this.options = args.options;
  }
}