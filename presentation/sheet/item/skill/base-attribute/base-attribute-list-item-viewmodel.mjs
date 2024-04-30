import { ATTRIBUTES, Attribute } from "../../../../../business/ruleset/attribute/attributes.mjs";
import InputDropDownViewModel from "../../../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";

/**
 * @property {InputTextFieldViewModel} vmName
 * 
 * @extends ViewModel
 */
export default class BaseAttributeListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_BASE_ATTRIBUTE_LIST_ITEM; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If `true`, input(s) will be in edit mode. 
   * Otherwise, input(s) will be in read-only mode.
   * 
   * @param {Attribute | undefined} args.attribute The current value. 
   * @param {Function | undefined} args.onChange Callback that is invoked when the value changes. 
   * * Receives one argument of type `Attribute`
   */
  constructor(args = {}) {
    super(args);

    this.onChange = args.onChange ?? (() => {});
    this.attribute = args.attribute ?? ATTRIBUTES.agility;

    const attributeChoices = ATTRIBUTES.asChoices();
    this.vmAttribute = new InputDropDownViewModel({
      id: "vmAttribute",
      parent: this,
      options: attributeChoices,
      value: attributeChoices.find(it => it.value === this.attribute.name),
      onChange: (_, newValue) => {
        const newAttribute = ATTRIBUTES[newValue.value];
        this.onChange(newAttribute);
      },
    });
  }
}