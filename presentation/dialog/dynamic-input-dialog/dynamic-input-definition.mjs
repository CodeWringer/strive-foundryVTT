import { ValidationUtil } from "../../../business/util/validation-utility.mjs";

/**
 * Represents an input control definition for a `DynamicInputDialog`. 
 * 
 * @property {String} name Internal name. The value of the input will be referencable 
 * by this name. 
 * @property {String | undefined} template String path to the template to render the control with. 
 * @property {Function | undefined} viewModelFactory Must return a `ViewModel` instance. Is `async` and receives the following arguments:
 * * `id: String`
 * * `parent: ViewModel`
 * * `overrides: Object` - Specific overrides that are to be applied to the instance the 
 * factory aims to create. 
 * @property {String | undefined} localizedLabel Localized companion label. 
 * * default `""`
 * @property {String | undefined} iconHtml E. g. `'<i class="fas fa-plus"></i>'`
 * @property {Boolean | undefined} required If true, the represented input must have a valid 
 * input, to allow dialog confirmation. 
 * * Default `false`. 
 * @property {Boolean | undefined} showFancyFont If true, will render labels using the 
 * fancy font. 
 * * Default `false`
 * @property {Boolean} rememberValue If `true`, then the value of the input will be 
 * saved for when the dialog is opened next time, and then retrieved, overriding whatever 
 * value the `viewModelFactory` might try to set. 
 * 
 * **IMPORTANT** in order for this mechanism to work, the `DynamicInputDialogViewModel` instance **MUST** 
 * have a consistent `id`!
 * @property {Function | undefined} validationFunc A validation function. 
 * * Receives the current value of the control as its input and must return a boolean 
 * value. `true` signalizes a successful validation without errors, while `false` 
 * indicates validation failed. 
 * 
 * @property {Boolean} isRenderable Returns `true`, if the control has a defined view model factory and a template. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {Any}`
 * * `newValue: {Any}`
 * * `dialogViewModel: {DynamicInputDialogViewModel}`
 */
export default class DynamicInputDefinition {
  /**
   * Returns `true`, if the control has a defined view model factory and a template. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isRenderable() {
    return ValidationUtil.isDefined(this.viewModelFactory) 
      && ValidationUtil.isNotBlankOrUndefined(this.template);
  }

  /**
   * @param {Object} args 
   * @param {String} args.name Internal name. The value of the input will be referencable 
   * by this name. 
   * @param {String | undefined} args.template String path to the template to render the control with. 
   * @param {Function | undefined} args.viewModelFactory Must return a `ViewModel` instance. Is `async` 
   * and receives the following arguments:
   * * `id: String`
   * * `parent: ViewModel`
   * * `overrides: Object` - Specific overrides that are to be applied to the instance the 
   * factory aims to create. 
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
   * @param {Boolean | undefined} args.rememberValue If `true`, then the value of the input will be 
   * saved for when the dialog is opened next time, and then retrieved, overriding whatever 
   * value the `viewModelFactory` might try to set. 
   * 
   * **IMPORTANT** in order for this mechanism to work, the `DynamicInputDialogViewModel` instance **MUST** 
   * have a consistent `id`!
   * @param {Function | undefined} args.onChange Callback that is invoked when the value changes. 
   * Receives the following arguments: 
   * * `oldValue: {Any}`
   * * `newValue: {Any}`
   * * `dialogViewModel: {DynamicInputDialogViewModel}`
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
    this.rememberValue = args.rememberValue ?? false;
    this.onChange = args.onChange;
  }
}
