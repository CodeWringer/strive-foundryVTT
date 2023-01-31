import { getNestedPropertyValue, setNestedPropertyValue } from "../../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonToggleIconViewModel from "../button-toggle-icon/button-toggle-icon-viewmodel.mjs";

/**
 * @extends ViewModel
 */
export default class VisibilityToggleListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_VISIBILITY_TOGGLE_LIST_ITEM; }

  /**
   * Gets or sets the value. 
   * 
   * @type {Boolean}
   */
  get value() {
    return getNestedPropertyValue(this.propertyOwner, this.propertyPath);
  }
  set value(value) {
    const oldValue = this.value;
    setNestedPropertyValue(this.propertyOwner, this.propertyPath, value);
    this.onChange(oldValue, value);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {Object} args.propertyOwner
   * @param {String} args.propertyPath
   * @param {String} args.localizedLabel A localized label for the state. 
   * @param {Function | undefined} args.onChange
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyOwner", "propertyPath", "localizedLabel"]);

    this.propertyOwner = args.propertyOwner;
    this.propertyPath = args.propertyPath;
    this.localizedLabel = args.localizedLabel;
    this.onChange = args.onChange ?? this.onChange;
    
    this.btnToggle = new ButtonToggleIconViewModel({
      id: "btnToggle",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      target: this,
      propertyPath: "value",
      iconActive: '<i class="fas fa-eye"></i>',
      iconInactive: '<i class="fas fa-eye-slash"></i>',
    });
  }

  /**
   * Invoked **after** every value change that was invoked by this 
   * view model. 
   * 
   * This method is intended for use in a parent `ViewModel` 
   * to listen for changes, so that the ui may be updated appropriately. 
   * 
   * @param {Boolean} oldValue 
   * @param {Boolean} newValue 
   */
  onChange(oldValue, newValue) { /* Implementation up to the user. */}

  /** @override */
  dispose() {
    this.onChange = null;

    super.dispose();
  }
}