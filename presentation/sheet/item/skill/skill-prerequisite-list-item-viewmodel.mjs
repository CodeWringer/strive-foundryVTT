import SkillPrerequisite from "../../../../business/ruleset/skill/skill-prerequisite.mjs";
import ObservableField from "../../../../common/observables/observable-field.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

// TODO: The observables in here should be unnecessary wiht the new input API.
/**
 * @property {InputTextFieldViewModel} vmName
 * @property {InputTextFieldViewModel} vmId
 * @property {InputNumberSpinnerViewModel} vmMinimumLevel
 * 
 * @extends ViewModel
 */
export default class SkillPrerequisiteListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_PREREQUISITE_LIST_ITEM; }

  /**
   * Returns an object representation of the data. 
   * 
   * @type {SkillPrerequisite}
   */
  get state() {
    return new SkillPrerequisite({
      id: this.stateId.value,
      name: this.stateName.value,
      minimumLevel: this.stateMinimumLevel.value,
    });
  }
  /**
   * Returns an object representation of the data. 
   * 
   * @param {SkillPrerequisite} value 
   */
  set state(value) {
    this.stateId.value = value.id;
    this.stateName.value = value.name;
    this.stateMinimumLevel.value = value.minimumLevel;
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {String | undefined} args.stateId
   * @param {String | undefined} args.stateName
   * @param {Number | undefined} args.stateMinimumLevel
   * * Default `0`
   * @param {Function | undefined} args.onChange Callback that is invoked when the value changes. 
   * * Receives one argument of type `SkillPrerequisite`
   */
  constructor(args = {}) {
    super(args);

    this.onChange = args.onChange ?? (() => {});

    this.stateId = new ObservableField({ value: args.stateId })
    this.stateId.onChange((field, oldValue, newValue) => {
      this.onChange(this.state);
    });

    this.stateName = new ObservableField({ value: args.stateName })
    this.stateName.onChange((field, oldValue, newValue) => {
      this.onChange(this.state);
    });

    this.stateMinimumLevel = new ObservableField({ value: (args.stateMinimumLevel ?? 0)})
    this.stateMinimumLevel.onChange((field, oldValue, newValue) => {
      this.onChange(this.state);
    });

    this.vmId = new InputTextFieldViewModel({
      id: "vmId",
      parent: this,
      value: this.stateId.value,
      onChange: (_, newValue) => {
        this.stateId.value = newValue;
      },
    });
    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      value: this.stateName.value,
      onChange: (_, newValue) => {
        this.stateName.value = newValue;
      },
    });
    this.vmMinimumLevel = new InputNumberSpinnerViewModel({
      id: "vmMinimumLevel",
      parent: this,
      value: this.stateMinimumLevel.value,
      onChange: (_, newValue) => {
        this.stateMinimumLevel.value = newValue;
      },
      min: 0,
    });
  }
}