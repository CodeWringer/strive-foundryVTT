import { COMPARISON_TYPES } from "../../../../business/model/domain/const/comparison-types.mjs";
import GradedEffect from "../../../../business/model/domain/graded-effect.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import InputDropDownViewModel from "../input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputRichTextViewModel from "../input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../input-textfield/input-textfield-viewmodel.mjs";

export default class GradedEffectViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.gradedEffect.item; }

  /** @override */
  get clazz() { return GradedEffectViewModel; }

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
   * @param {GradedEffect | undefined} args.document 
   * @param {Function<void> | undefined} args.onChange
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.onChange = args.onChange ?? (() => {});

    const comparisonOptions = ChoicesUtil.getAsChoices(COMPARISON_TYPES);
    this.vmComparison = new InputDropDownViewModel({
      id: "vmComparison",
      parent: this,
      value: comparisonOptions.find(it => it.value === this.document.comparisonType.name),
      options: comparisonOptions,
      onChange: (_, newValue) => {
        this.document.comparisonType = comparisonOptions.find(it => it.value === newValue.comparisonType.name);
        this.onChange(undefined, this.document);
      },
    });
    this.vmThreshold = new InputNumberSpinnerViewModel({
      id: "vmThreshold",
      parent: this,
      value: this.document.threshold,
      onChange: (_, newValue) => {
        this.document.threshold = newValue;
        this.onChange(undefined, this.document);
      },
    });
    this.vmComparisonTarget = new InputTextFieldViewModel({
      id: "vmComparisonTarget",
      parent: this,
      value: this.document.comparisonTarget,
      onChange: (_, newValue) => {
        this.document.comparisonTarget = newValue;
        this.onChange(undefined, this.document);
      },
    });
    this.vmEffect = new InputRichTextViewModel({
      id: "vmEffect",
      parent: this,
      value: this.document.effect,
      onChange: (_, newValue) => {
        this.document.effect = newValue;
        this.onChange(undefined, this.document);
      },
    });
  }
}