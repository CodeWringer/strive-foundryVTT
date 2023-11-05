import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents the base type of choice inputs. 
 * 
 * @extends InputViewModel
 * 
 * @property {Array<ChoiceOption>} options Gets the options available. 
 * * Read-only. 
 * @property {ChoiceAdapter} adapter A `ChoiceOption` adapter. 
 * * Often times, the actual value of a field on a document is not of type `ChoiceOption`, 
 * but rather some other business type. This adapter allows mapping to and from `ChoiceOption`s,
 * based on those actual values.
 * 
 * @abstract
 */
export default class InputChoiceViewModel extends InputViewModel {
  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   * 
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   * @param {ChoiceAdapter} adapter A `ChoiceOption` adapter. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner", "options", "adapter"]);

    this.options = args.options;
    this.adapter = args.adapter;
  }
}