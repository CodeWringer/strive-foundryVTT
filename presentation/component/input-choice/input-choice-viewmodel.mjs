import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents the base type of choice inputs. 
 * 
 * @extends InputViewModel
 * 
 * @property {Array<ChoiceOption>} options Gets the options available. 
 * * Read-only. 
 * 
 * @abstract
 */
export default class InputChoiceViewModel extends InputViewModel {
  /**
   * @param {Object} args 
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["options"]);

    this.options = args.options;
  }
}