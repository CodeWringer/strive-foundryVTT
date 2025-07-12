import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import DynamicInputDefinition from "./dynamic-input-definition.mjs";
import { DYNAMIC_INPUT_TYPES } from "./dynamic-input-types.mjs";

/**
 * Allows editing a dynamic number of entries in a list. 
 * 
 * For use in a `DynamicInputDialog`. 
 * 
 * @property {DYNAMIC_INPUT_TYPES} type Returns `DYNAMIC_INPUT_TYPES.SIMPLE_LIST`. 
 * @property {String} name Internal name. The value of the input will be referencable 
 * by this name. 
 * @property {String | undefined} localizedLabel Localized companion label. 
 * @property {String | undefined} iconHtml E. g. `'<i class="fas fa-plus"></i>'`
 * @property {Boolean} required If true, the represented input must have a valid 
 * input, to allow dialog confirmation. 
 * @property {Boolean} isEditable If true, enables the control. If false, renders 
 * it in read-only mode. 
 * @property {Array<String>} defaultValue A default value to initialize the 
 * input control with. 
 * @property {Boolean} showFancyFont If true, will render labels using the fancy font. 
 * @property {Function | undefined} validationFunc A validation function. 
 * * Receives the current value of the control as its input and must return a boolean 
 * value. `true` signalizes a successful validation without errors, while `false` 
 * indicates validation failed. 
 * 
 * @property {String} contentItemTemplate String path of the template to render list 
 * entries with. 
 * @property {Function} contentItemViewModelFactory The factory function used to get view model 
 * instances. Receives the current index as first and the values array as second argument. 
 * Is expected to return a new view model instance. 
 * 
 * @property {Any | undefined} newItemDefaultValue
 * @property {Boolean | undefined} isItemAddable
 * @property {Boolean | undefined} isItemRemovable
 * @property {String | undefined} localizedAddLabel
 * 
 * @method onChange Async callback that is invoked when the 
 * value changes. Arguments:
 * * `oldValue: Array<String>`
 * * `newValue: Array<String>`
 * * `dialogViewModel: DynamicInputDialogViewModel`
 * 
 * @extends DynamicInputDefinition
 */
export default class DynamicInputDefinitionSimpleList extends DynamicInputDefinition {
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
   * @param {Array<String>} args.defaultValue A default value to initialize the 
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
   * * `oldValue: Array<String>`
   * * `newValue: Array<String>`
   * * `dialogViewModel: DynamicInputDialogViewModel`
   * 
   * @param {String} args.contentItemTemplate String path of the template to render list 
   * entries with. 
   * @param {Function} args.contentItemViewModelFactory The factory function used to get view model 
   * instances. Receives the current index as first and the values array as second argument. 
   * Is expected to return a new view model instance. 
   * @param {Any | undefined} args.newItemDefaultValue
   * @param {Boolean | undefined} args.isItemAddable
   * @param {Boolean | undefined} args.isItemRemovable
   * @param {String | undefined} args.localizedAddLabel
   */
  constructor(args = {}) {
    super({
      ...args,
      type: DYNAMIC_INPUT_TYPES.SIMPLE_LIST,
    });
    ValidationUtil.validateOrThrow(args, ["contentItemTemplate", "contentItemViewModelFactory"]);

    this.contentItemTemplate = args.contentItemTemplate;
    this.contentItemViewModelFactory = args.contentItemViewModelFactory;
    this.newItemDefaultValue = args.newItemDefaultValue;
    this.isItemAddable = args.isItemAddable;
    this.isItemRemovable = args.isItemRemovable;
    this.localizedAddLabel = args.localizedAddLabel;
  }
}