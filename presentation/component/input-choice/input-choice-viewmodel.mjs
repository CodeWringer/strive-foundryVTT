import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents the base type of choice inputs. 
 * 
 * @extends InputViewModel
 * 
 * @property {ChoiceOption} value The current value. 
 * @property {Array<ChoiceOption>} options Gets the options available. 
 * * Read-only. 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {ChoiceOption}`
 * * `newValue: {ChoiceOption}`
 * 
 * @abstract
 */
export default class InputChoiceViewModel extends InputViewModel {
  /**
   * @param {Object} args 
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