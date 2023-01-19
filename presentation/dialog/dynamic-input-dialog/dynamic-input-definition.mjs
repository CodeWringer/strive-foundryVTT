import { validateOrThrow } from "../../../business/util/validation-utility.mjs";

/**
 * Represents an input control definition for a `DynamicInputDialog`. 
 * @property {DYNAMIC_INPUT_TYPES} type
 * @property {String} name Internal name. The value of the input will be referencable 
 * by this name. 
 * @property {String | undefined} localizableLabel Localization key for a companion 
 * label. 
 * @property {String | undefined} localizedLabel Localized label. 
 * * Read-only. 
 * @property {Object | undefined} specificArgs Arguments specific to the type 
 * of represented input control. 
 * @property {Boolean} required If true, the represented input must have a valid 
 * input, to allow dialog confirmation. 
 * @property {Any | undefined} defaultValue A default value to initialize the 
 * input control with. 
 * @property {Function | undefined} validationFunc A validation function. 
 * * Receives the current value of the control as its input and must return a boolean 
 * value. `true` signalizes a successful validation without errors, while `false` 
 * indicates validation failed. 
 */
export default class DynamicInputDefinition {
  get localizedLabel() {
    if(this.localizableLabel === undefined) {
      return undefined;
    } else {
      return game.i18n.localize(this.localizableLabel);
    }
  }

  /**
   * @param {Object} args 
   * @param {DYNAMIC_INPUT_TYPES} args.type
   * @param {String} args.name Internal name. The value of the input will be referencable 
   * by this name. 
   * @param {String | undefined} args.localizableLabel Localization key for a companion 
   * label. 
   * @param {Object | undefined} args.specificArgs Arguments specific to the type 
   * of represented input control. 
   * @param {Boolean | undefined} args.required If true, the represented input must have a valid 
   * input, to allow dialog confirmation. 
   * * Default `false`. 
   * @param {Any | undefined} args.defaultValue A default value to initialize the 
   * input control with. 
   * @param {Function | undefined} args.validationFunc A validation function. 
   * * Receives the current value of the control as its input and must return a boolean 
   * value. `true` signalizes a successful validation without errors, while `false` 
   * indicates validation failed. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["type", "name"]);

    this.type = args.type;
    this.name = args.name;
    this.localizableLabel = args.localizableLabel;
    this.specificArgs = args.specificArgs ?? {};
    this.required = args.required ?? false;
    this.defaultValue = args.defaultValue;
    this.validationFunc = args.validationFunc;
  }
}