import { COMPARISON_TYPES } from "../../../../business/model/domain/const/comparison-types.mjs";
import GradedEffect from "../../../../business/model/domain/graded-effect.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { SlideDisplaceAnim } from "../../../animation/slide-displace-anim.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import InputDropDownViewModel from "../input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../input-number-spinner/input-number-spinner-viewmodel.mjs";

export default class GradedEffectViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.gradedEffect.item; }

  /** @override */
  get clazz() { return GradedEffectViewModel; }

  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    const editElement = this.element.find("> div > .edit-mode");
    const readElement = this.element.find("> div > .read-mode");
    if (!this._suppressAnims) {
      if (value) {
        new SlideDisplaceAnim({
          displacingElement: editElement,
          displacedElement: readElement,
        }).execute();
      } else {
        new SlideDisplaceAnim({
          displacingElement: readElement,
          displacedElement: editElement,
        }).execute();
      }
    } else {
      if (value) {
        editElement.removeClass("hidden");
        readElement.addClass("hidden");
      } else {
        editElement.addClass("hidden");
        readElement.removeClass("hidden");
      }
    }
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Object | undefined} args.document An associated data document. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {GradedEffect} args.document 
   * @param {Function<void> | undefined} args.onChange Invoked when any property value of 
   * the document changes. Arguments: 
   * * `fieldName: String` - Name of the field/property on this instance that was changed. 
   * * `newValue: Any` - Value after the change, and the current value. 
   * * `oldValue: Any` - Value prior to the change. 
   */
  constructor(args = {}) {
    super(args);

    this.onChange = args.onChange ?? (() => { });

    this.document = args.document;
    this.document.onChange = (fieldName, newValue, oldValue) => {
      this.onChange(fieldName, newValue, oldValue);
    }

    const comparisonTypeOptions = ChoicesUtil.getAsChoices(COMPARISON_TYPES);
    let comparisonTypeOption = comparisonTypeOptions[0];
    if (ValidationUtil.isDefined(this.document.comparisonType)) {
      comparisonTypeOption = comparisonTypeOptions.find(it => it.value === this.document.comparisonType.name);
    }
    this.vmComparisonType = new InputDropDownViewModel({
      id: "vmComparisonType",
      parent: this,
      value: comparisonTypeOption,
      options: comparisonTypeOptions,
      onChange: (newVal) => {
        this.document.comparisonType = COMPARISON_TYPES[newVal.value];
      },
    });

    this.vmThreshold = new InputNumberSpinnerViewModel({
      id: "vmThreshold",
      parent: this,
      value: this.document.threshold,
      onChange: (newVal) => {
        this.document.threshold = newVal;
      },
    });
  }

  async activateListeners(html) {
    await super.activateListeners(html);

    const editElement = this.element.find("> div > .edit-mode");
    const readElement = this.element.find("> div > .read-mode");
    if (this.isEditable) {
      editElement.removeClass("hidden");
      readElement.addClass("hidden");
    } else {
      editElement.addClass("hidden");
      readElement.removeClass("hidden");
    }
  }
}
