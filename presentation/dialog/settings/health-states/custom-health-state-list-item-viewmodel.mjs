import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * @property {HealthState} healthState
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
   * @param {HealthState} args.healthState
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["healthState"]);

    this.healthState = args.healthState;

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      propertyOwner: this.healthState,
      propertyPath: "name",
    });
  }
}