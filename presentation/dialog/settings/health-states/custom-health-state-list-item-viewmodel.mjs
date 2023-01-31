import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
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
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Name or path of a template that embeds this input component. 
   * 
   * @param {String} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {Function | undefined} args.onChange Callback that is invoked when the value changes. 
   * * Receives two arguments: 
   * * * `oldValue: {Any}`
   * * * `newValue: {Any}`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "propertyPath"]);

    this.propertyOwner = args.propertyOwner;
    this.propertyPath = args.propertyPath;
    this.onChange = args.onChange ?? (() => {});

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      isEditable: this.isEditable,
      propertyOwner: this.propertyOwner,
      propertyPath: this.propertyPath,
      onChange: this.onChange,
    });
  }
}