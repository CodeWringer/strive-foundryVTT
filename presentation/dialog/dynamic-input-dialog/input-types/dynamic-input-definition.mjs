import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";

/**
 * Represents an input control definition for a `DynamicInputDialog`. 
 * 
 * @property {DYNAMIC_INPUT_TYPES} type An internal type. 
 * @property {String} name Internal name. The value of the input will be referencable 
 * by this name. 
 * @property {String | undefined} localizedLabel Localized companion label. 
 * @property {String | undefined} iconHtml E. g. `'<i class="fas fa-plus"></i>'`
 * @property {Boolean} required If true, the represented input must have a valid 
 * input, to allow dialog confirmation. 
 * @property {Boolean} isEditable If true, enables the control. If false, renders 
 * it in read-only mode. 
 * @property {Any | undefined} defaultValue A default value to initialize the 
 * input control with. 
 * @property {Boolean} showFancyFont If true, will render labels using the fancy font. 
 * @property {Function | undefined} validationFunc A validation function. 
 * * Receives the current value of the control as its input and must return a boolean 
 * value. `true` signalizes a successful validation without errors, while `false` 
 * indicates validation failed. 
 * 
 * @method onChange Async callback that is invoked when the 
 * value changes. Arguments:
 * * `oldValue: Any`
 * * `newValue: Any`
 * * `dialogViewModel: DynamicInputDialogViewModel`
 * 
 * @abstract
 */
export default class DynamicInputDefinition {
  /**
   * @param {Object} args 
   * @param {DYNAMIC_INPUT_TYPES} args.type An internal type. 
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
   * @param {Any | undefined} args.defaultValue A default value to initialize the 
   * input control with. 
   * @param {Boolean | undefined} args.showFancyFont If true, will render labels using the 
   * fancy font. 
   * * Default `false`
   * @param {Function | undefined} args.validationFunc A validation function. 
   * * Receives the current value of the control as its input and must return a boolean 
   * value. `true` signalizes a successful validation without errors, while `false` 
   * indicates validation failed. 
   * @param {Function | undefined} args.onChange Async callback that is invoked when the 
   * value changes. Arguments:
   * * `oldValue: Any`
   * * `newValue: Any`
   * * `dialogViewModel: DynamicInputDialogViewModel`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["type", "name"]);

    this.type = args.type;
    this.name = args.name;
    this.localizedLabel = args.localizedLabel ?? "";
    this.iconHtml = args.iconHtml;
    this.required = args.required ?? false;
    this.isEditable = args.isEditable ?? true;
    this.defaultValue = args.defaultValue;
    this.showFancyFont = args.showFancyFont ?? false;
    this.validationFunc = args.validationFunc;
    this.onChange = args.onChange ?? (async () => {});
  }
}