import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import InputImageViewModel from "../../../component/input-image/input-image-viewmodel.mjs";

/**
 * @property {InputTextFieldViewModel} vmName
 * 
 * @extends ViewModel
 */
export default class CustomHealthStateListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.CUSTOM_HEALTH_STATE_LIST_ITEM; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {String} args.stateName
   * @param {Number | undefined} args.stateLimit
   * * Default `0`
   * @param {String | undefined} args.stateIconPath
   * @param {Function | undefined} args.onChange Callback that is invoked when the value changes. 
   * * Receives one argument: 
   * * * `state: {Object}`
   * * * `state.name: {String}`
   * * * `state.limit: {Number}`
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["stateName"]);

    this.state = {
      iconPath: args.stateIconPath,
      name: args.stateName,
      limit: args.stateLimit,
    };
    this.onChange = args.onChange ?? (() => {});

    this.vmImg = new InputImageViewModel({
      parent: this,
      id: "vmImg",
      value: this.state.iconPath,
      onChange: (_, newValue) => {
        this.state.iconPath = newValue;
        this.onChange(this.state);
      },
    });
    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      value: this.state.name,
      onChange: (_, newValue) => {
        this.state.name = newValue;
        this.onChange(this.state);
      },
    });
    this.vmLimit = new InputNumberSpinnerViewModel({
      id: "vmLimit",
      parent: this,
      value: this.state.limit,
      min: 0,
      onChange: (_, newValue) => {
        this.state.limit = newValue;
        this.onChange(this.state);
      },
    });
  }
}