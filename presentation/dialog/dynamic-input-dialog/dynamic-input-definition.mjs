import { ValidationUtil } from "../../../business/util/validation-utility.mjs";

/**
 * Represents an input control definition for a `DynamicInputDialog`. 
 * 
 * @property {String} name Internal name. The value of the input will be referencable 
 * by this name. 
 * @property {String | undefined} template String path to the template to render the control with. 
 * @property {Function | undefined} viewModelFactory Must return a `ViewModel` instance. Receives the following arguments:
 * * `id: String`
 * * `parent: ViewModel`
 * * `value: Any | undefined`
 * @property {String | undefined} localizedLabel Localized companion label. 
 * * default `""`
 * @property {String | undefined} iconHtml E. g. `'<i class="fas fa-plus"></i>'`
 * @property {Boolean | undefined} required If true, the represented input must have a valid 
 * input, to allow dialog confirmation. 
 * * Default `false`. 
 * @property {Boolean | undefined} showFancyFont If true, will render labels using the 
 * fancy font. 
 * * Default `false`
 * @property {Function | undefined} validationFunc A validation function. 
 * * Receives the current value of the control as its input and must return a boolean 
 * value. `true` signalizes a successful validation without errors, while `false` 
 * indicates validation failed. 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Any}`
 * * `newValue: {Any}`
 */
export default class DynamicInputDefinition {
  /**
   * @param {Object} args 
   * @param {String} args.name Internal name. The value of the input will be referencable 
   * by this name. 
   * @param {String | undefined} args.template String path to the template to render the control with. 
   * @param {Function | undefined} args.viewModelFactory Must return a `ViewModel` instance. Receives the following arguments:
   * * `id: String`
   * * `parent: ViewModel`
   * @param {String | undefined} args.localizedLabel Localized companion label. 
   * * default `""`
   * @param {String | undefined} args.iconHtml E. g. `'<i class="fas fa-plus"></i>'`
   * @param {Boolean | undefined} args.required If true, the represented input must have a valid 
   * input, to allow dialog confirmation. 
   * * Default `false`. 
   * @param {Boolean | undefined} args.showFancyFont If true, will render labels using the 
   * fancy font. 
   * * Default `false`
   * @param {Function | undefined} args.validationFunc A validation function. **Must** return a boolean 
   * value. `true` signalizes a successful validation without errors, while `false` 
   * indicates validation failed. Receives arguments: 
   * * `currentValue: Any`
   * @param {Function | undefined} onChange Callback that is invoked when the value changes. 
   * Receives the following arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.template = args.template;
    this.viewModelFactory = args.viewModelFactory;
    
    this.localizedLabel = args.localizedLabel ?? "";
    this.iconHtml = args.iconHtml;
    this.required = args.required ?? false;
    this.showFancyFont = args.showFancyFont ?? false;
    this.validationFunc = args.validationFunc;
    this.onChange = args.onChange;
  }
}
