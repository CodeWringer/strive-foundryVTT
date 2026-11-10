import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import ChoiceOption from "../../../model/choice-option.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents the base type of choice inputs, such as a drop-down or radio-button-group. 
 * 
 * @extends InputViewModel
 * 
 * @property {String} id Unique ID of this view model instance. 
 * @property {Boolean} isEditable If `true`, input(s) will 
 * be in edit mode. If `false`, will be in read-only mode.
 * @property {JQuery | HTMLElement} element The DOM element that is 
 * associated with this view model. 
 * * Read-only
 * @property {String | undefined} localizedToolTip A localized text to 
 * display as a tool tip. 
 * 
 * @property {Any | undefined} value The current value. 
 * * Upon change, invokes the `onChange` callback. 
 * 
 * @property {ChoiceOption} value The current value. 
 * @property {Array<ChoiceOption>} options Gets the options available. 
 * * Read-only. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {ChoiceOption}`
 * * `newValue: {ChoiceOption}`
 * @method onInput Callback that is invoked when any input is made (by keyboard or mouse or other input device). 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @method onFocus Callback that is invoked when the input element is focused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * @method onFocusLost Callback that is invoked when the input element is unfocused. 
 * * `event: {Event}`
 * * `viewModel: {ViewModel}`
 * 
 * @abstract
 */
export default class InputChoiceViewModel extends InputViewModel {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will 
   * be in edit mode. If `false`, will be in read-only mode.
   * * default `false`. 
   * 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * 
   * @param {ChoiceOption | undefined} args.value The current value. 
   * * default is the first option given.
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
   * @param {Array<ChoiceOption>} args.options The options available to the drop-down. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {ChoiceOption}`
   * * `newValue: {ChoiceOption}`
   */
  constructor(args = {}) {
    super({
      ...args,
      value: args.value ?? (args.options.length > 0 ? args.options[0] : undefined),
    });
    ValidationUtil.validateOrThrow(args, ["options"]);

    this.options = args.options;
  }
}