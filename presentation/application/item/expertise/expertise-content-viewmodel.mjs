import { TARGETING_TYPES } from "../../../../business/model/domain/const/targeting-types.mjs";
import ExpertiseDocument from "../../../../business/model/document/item/expertise-document.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import VisibilityRule from "../../../model/visibility-rule.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import GradedEffectListViewModel from "../../component/graded-effect/graded-effect-list-viewmodel.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputReferenceViewModel from "../../component/input-reference/input-reference-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";

export default class ExpertiseContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.expertise.content; }

  /** @override */
  get clazz() { return ExpertiseContentViewModel; }

  get hasDynamicContent() {
    return this.document.gradedEffects.entries > 0 
      || this.document.actionPoints.current > 0
      || this.document.distance.current !== 0
      || this.document.targetingType.enabled
      || this.document.obstacle.enabled
      ;
  }

  /** @override */
  get visibilityRules() {
    return super.visibilityRules.concat([
      new VisibilityRule({
        selector: "> div > .dynamic-content",
        shouldBeHidden: () => !this.isEditable && !this.hasDynamicContent,
      }),
      new VisibilityRule({
        selector: "> div > .dynamic-content > div > .graded-effects",
        shouldBeHidden: () => !this.isEditable && this.document.gradedEffects.entries < 1,
      }),
      new VisibilityRule({
        selector: "> div > .dynamic-content > div > .action-points",
        shouldBeHidden: () => !this.isEditable && this.document.actionPoints.current < 1,
      }),
      new VisibilityRule({
        selector: "> div > .dynamic-content > div > .distance",
        shouldBeHidden: () => !this.isEditable && this.document.distance.current === 0,
      }),
      new VisibilityRule({
        selector: "> div > .dynamic-content > div > .targeting-type",
        shouldBeHidden: () => !this.isEditable && this.document.targetingType.current.name === TARGETING_TYPES.none.name,
      }),
      new VisibilityRule({
        selector: "> div > .dynamic-content > div > .obstacle",
        shouldBeHidden: () => !this.isEditable && !this.document.obstacle.enabled,
      }),
    ]);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {ExpertiseDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);

    this.vmDescription = new InputRichTextViewModel({
      id: "vmDescription",
      parent: this,
      isEditable: this.isEditable,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.general.description"),
      }),
      value: this.document.description,
      onChange: (newValue) => {
        this.document.description = newValue;
      },
    });
    this.vmActionPoints = new InputNumberSpinnerViewModel({
      id: "vmActionPoints",
      parent: this,
      value: this.document.actionPoints.current,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.expertise.actionPoints"),
      }),
      onChange: (newValue) => {
        this.document.actionPoints.current = newValue;
      },
    });
    this.vmDistance = new InputNumberSpinnerViewModel({
      id: "vmDistance",
      parent: this,
      value: this.document.distance.current,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.expertise.distance"),
      }),
      onChange: (newValue) => {
        this.document.distance.current = newValue;
      },
    });

    const targetingTypeOptions = ChoicesUtil.getAsChoices(TARGETING_TYPES, "xl");
    let currentTargetingType = targetingTypeOptions[0];
    if (ValidationUtil.isDefined(this.document.targetingType.current)) {
      currentTargetingType = targetingTypeOptions.find(it => it.value === this.document.targetingType.current.name);
    }
    this.vmTargetingType = new InputDropDownViewModel({
      id: "vmTargetingType",
      parent: this,
      value: currentTargetingType,
      options: targetingTypeOptions,
      showValue: false,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.format(
          StringUtil.getLoca("system.domain.targetingType.targetingTypeOf"),
          currentTargetingType.localizedValue,
        ),
      }),
      onChange: (newValue) => {
        this.document.targetingType.current = TARGETING_TYPES[newValue.value];
      },
    });

    this.vmObstacle = new InputTextFieldViewModel({
      id: "vmObstacle",
      parent: this,
      value: this.document.obstacle.current,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.expertise.obstacle"),
      }),
      onChange: (newValue) => {
        this.document.obstacle.current = newValue;
      },
    });
    this.vmOpposedBy = new InputReferenceViewModel({
      id: "vmOpposedBy",
      parent: this,
      value: this.document.opposedBy.current,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.expertise.opposedBy"),
      }),
      onChange: (newValue) => {
        this.document.opposedBy.current = newValue;
      },
    });

    this.vmGradedEffects = new GradedEffectListViewModel({
      id: "vmGradedEffects",
      parent: this,
      value: this.document.gradedEffects.entries,
      onChange: (newValue) => {
        this.document.gradedEffects.entries = newValue;
      },
    });
  }
}
