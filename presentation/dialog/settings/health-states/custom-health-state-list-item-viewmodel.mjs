import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ObservableField from "../../../../common/observables/observable-field.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

/**
 * @property {InputTextFieldViewModel} vmName
 * 
 * @extends ViewModel
 */
export default class CustomHealthStateListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.CUSTOM_HEALTH_STATE_LIST_ITEM; }

  /**
   * Returns an object representation of the data. 
   * 
   * @type {Object}
   * @private
   * @readonly
   */
  get state() { return {
      name: this.stateName.value,
      limit: this.stateLimit.value,
    };
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {String} args.stateName
   * @param {Number | undefined} args.stateLimit
   * * Default `0`
   * @param {Function | undefined} args.onChange Callback that is invoked when the value changes. 
   * * Receives one argument: 
   * * * `state: {Object}`
   * * * `state.name: {String}`
   * * * `state.limit: {Number}`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["stateName"]);

    this.onChange = args.onChange ?? (() => {});

    this.stateName = new ObservableField({ value: args.stateName})
    this.stateName.onChange((field, oldValue, newValue) => {
      this.onChange(this.state);
    });

    this.stateLimit = new ObservableField({ value: (args.stateLimit ?? 0)})
    this.stateLimit.onChange((field, oldValue, newValue) => {
      this.onChange(this.state);
    });

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      isEditable: this.isEditable,
      propertyOwner: this,
      propertyPath: "stateName.value",
    });
    this.vmLimit = new InputNumberSpinnerViewModel({
      id: "vmLimit",
      parent: this,
      isEditable: this.isEditable,
      propertyOwner: this,
      propertyPath: "stateLimit.value",
      min: 0,
    });
  }
}