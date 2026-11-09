import ComparisonTarget from "../../../../business/model/domain/comparison-target.mjs";
import { COMPARISON_TARGET_TYPES } from "../../../../business/model/domain/const/comparison-target-types.mjs";
import { COMPARISON_TYPES } from "../../../../business/model/domain/const/comparison-types.mjs";
import GradedEffect from "../../../../business/model/domain/graded-effect.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import VisibilityRule from "../../../model/visibility-rule.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import DocumentViewModel from "../../view-model/document-viewmodel.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import ButtonDropDownViewModel from "../button-dropdown/button-dropdown-viewmodel.mjs";
import { DropDownOption } from "../button-dropdown/dropdown-option.mjs";
import InputDropDownViewModel from "../input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRichTextViewModel from "../input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";

export default class GradedEffectViewModel extends DocumentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.gradedEffect.item; }

  /** @override */
  get clazz() { return GradedEffectViewModel; }

  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    this.#updateDynamicConent();
  }

  /** @override */
  get visibilityRules() {
    return super.visibilityRules.concat([
      new VisibilityRule({
        selector: "> .context-menu",
        shouldBeHidden: () => !this.isEditable,
        hoverTriggerElementSelector: `#${this.id}`,
      }),
    ]);
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
   * @param {Function<void> | undefined} args.onDelete Invoked when the `GradedEffect` is to be deleted. 
   */
  constructor(args = {}) {
    super(args);

    this.onChange = args.onChange ?? (() => { });
    this.onDelete = args.onDelete ?? (() => { });

    this.document.onChange = (fieldName, newValue, oldValue) => {
      this.onChange(fieldName, newValue, oldValue);
    }

    const comparisonTypeOptions = ChoicesUtil.getAsChoices(COMPARISON_TYPES, "lg");
    let comparisonTypeOption = comparisonTypeOptions[0];
    if (ValidationUtil.isDefined(this.document.comparisonType)) {
      comparisonTypeOption = comparisonTypeOptions.find(it => it.value === this.document.comparisonType.name);
    }
    this.vmComparisonType = new InputDropDownViewModel({
      id: "vmComparisonType",
      parent: this,
      value: comparisonTypeOption,
      options: comparisonTypeOptions,
      showValue: false,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.comparisonType.comparisonType"),
      }),
      onChange: (newVal) => {
        this.document.comparisonType = COMPARISON_TYPES[newVal.value];
      },
    });

    const comparisonTargetTypeOptions = ChoicesUtil.getAsChoices(COMPARISON_TARGET_TYPES);
    let comparisonTargetTypeOption = comparisonTargetTypeOptions[0];
    if (ValidationUtil.isDefined(this.document.comparisonTarget)) {
      comparisonTargetTypeOption = comparisonTargetTypeOptions.find(it => it.value === this.document.comparisonTarget.type.name);
    }
    this.vmComparisonTargetType = new InputDropDownViewModel({
      id: "vmComparisonTargetType",
      parent: this,
      value: comparisonTargetTypeOption,
      options: comparisonTargetTypeOptions,
      visible: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.comparisonTargetType.comparisonTargetType"),
      }),
      onChange: (newVal) => {
        this.document.comparisonTarget = new ComparisonTarget({
          type: COMPARISON_TARGET_TYPES[newVal.value],
        });
        this.vmComparisonTargetData.visible = newVal.value !== COMPARISON_TARGET_TYPES.hit.name;
      },
    });
    this.vmComparisonTargetData = new InputTextFieldViewModel({
      id: "vmComparisonTargetData",
      parent: this,
      value: this.document.comparisonTarget?.data,
      visible: comparisonTargetTypeOption.value !== COMPARISON_TARGET_TYPES.hit.name,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.comparisonTarget.comparisonTarget"),
        additionalLocalized: StringUtil.getLoca("system.general.comparisonTarget.additional")
      }),
      onChange: (newValue) => {
        this.document.comparisonTarget = new ComparisonTarget({
          type: this.document.comparisonTarget?.type ?? COMPARISON_TARGET_TYPES.attribute,
          data: newValue,
        });
      },
    });

    this.vmThreshold = new InputNumberSpinnerViewModel({
      id: "vmThreshold",
      parent: this,
      value: this.document.threshold,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.comparisonThreshold.comparisonThreshold"),
        additionalLocalized: StringUtil.getLoca("system.general.comparisonThreshold.additional"),
      }),
      onChange: (newVal) => {
        this.document.threshold = newVal;
      },
    });
    this.vmUnstructured = new InputRichTextViewModel({
      id: "vmUnstructured",
      parent: this,
      value: this.document.unstructured,
      onChange: (newValue) => {
        this.document.unstructured = newValue;
      },
    });

    this.vmContextMenu = new ButtonDropDownViewModel({
      id: "context-menu",
      parent: this,
      options: [
        new DropDownOption({
          localizedValue: StringUtil.format(
            StringUtil.getLoca("system.general.delete.deleteOf"),
            StringUtil.getLoca("system.domain.gradedEffect.gradedEffect")
          ),
          icon: "fas fa-trash",
          onClick: () => {
            this.onDelete();
          },
        }),
      ],
      isEditable: true,
      visible: true,
      onClickContextData: args.item,
    });
  }

  async activateListeners(html) {
    await super.activateListeners(html);

    this.#updateDynamicConent();
  }

  /**
   * @private
   */
  #updateDynamicConent() {
    if (ValidationUtil.isDefined(this.vmComparisonTargetType)) {
      this.vmComparisonTargetType.visible = this.isEditable;
    }

    const emboldableElement = this.element.find("> .dynamic > .emboldable");
    const dynamicElm = this.element.find("> .dynamic");

    if (this.isEditable) {
      emboldableElement.removeClass("embolden");

      dynamicElm.removeClass("flex-row");
      dynamicElm.removeClass("flex-middle");
      dynamicElm.addClass("flex-column");
      dynamicElm.addClass("flex-grow");
    } else {
      emboldableElement.addClass("embolden");
      
      dynamicElm.addClass("flex-middle");
      dynamicElm.addClass("flex-row");
      dynamicElm.removeClass("flex-column");
      dynamicElm.removeClass("flex-grow");
    }
  }
}
