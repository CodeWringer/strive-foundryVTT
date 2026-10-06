import { TARGETING_TYPES } from "../../../../business/model/domain/const/targeting-types.mjs";
import Expertise from "../../../../business/model/domain/skill/expertise.mjs";
import { Skill } from "../../../../business/model/domain/skill/skill.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import { DropDownOption } from "../../component/button-dropdown/dropdown-option.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import GradedEffectListViewModel from "../../component/graded-effect/graded-effect-list-viewmodel.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputReferenceViewModel from "../../component/input-reference/input-reference-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputSplitNumberSpinnerViewModel from "../../component/input-split-number-spinner/input-split-number-spinner-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import ListItem from "../../component/list/list-item.mjs";
import ListSeparator from "../../component/list/list-separator.mjs";
import ListViewModel from "../../component/list/list-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";
import ExpertiseContentViewModel from "../expertise/expertise-content-viewmodel.mjs";
import ExpertiseHeaderViewModel from "../expertise/expertise-header-viewmodel.mjs";

export default class SkillContentViewModel extends BaseItemContentViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.item.skill.content; }

  /** @override */
  get clazz() { return SkillContentViewModel; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hasLockedExpertises() { return (this.lockedExpertises.length > 0); }

  /**
   * @type {Array<Expertise>}
   * @readonly
   */
  get lockedExpertises() {
    return this.document.expertises.filter(expertise => expertise.requiredLevel > this.document.level);
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {TransientSkill} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   * @param {DOCUMENT_CONTEXT | undefined} args.context Indicates whether this is an embedded or 
   * independent document. This affects interactibility. 
   * * default `DOCUMENT_CONTEXT.independent`
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
        localized: StringUtil.getLoca("system.item.skill.actionPoints"),
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
        localized: StringUtil.getLoca("system.item.skill.distance"),
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
        localized: StringUtil.getLoca("system.item.skill.obstacle"),
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
        localized: StringUtil.getLoca("system.item.skill.opposedBy"),
      }),
      onChange: (newValue) => {
        this.document.opposedBy.current = newValue;
      },
    });
    this.vmAdvancement = new InputSplitNumberSpinnerViewModel({
      id: "vmAdvancement",
      parent: this,
      toolTip: new ViewModelToolTipDefinition({
        localized: StringUtil.getLoca("system.item.skill.advancement"),
      }),
      current: {
        value: this.document.advancement.progress,
        min: 0,
        limitToMax: true,
      },
      maximum: {
        value: this.#getMaximumAdvancementProgress(),
        allowEditing: false,
      },
      onChange: (newValue) => {
        this.document.advancement.progress = newValue.current;
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

    const getSeparatorIndex = () => {
      for (let i = 0; i < this.document.expertises.length; i++) {
        const expertise = this.document.expertises[i];
        if (expertise.requiredLevel > this.document.level) {
          return i;
        };
      }
      return -1;
    };
    const mapExpertiseToListItem = (expertise) => {
      return new ListItem({
        id: expertise.id,
        header: new DynamicComponent({
          template: ExpertiseHeaderViewModel.TEMPLATE,
          viewModelFactory: (parent) => new ExpertiseHeaderViewModel({
            id: `${expertise.id}-header`,
            parent: parent,
            document: expertise,
            sheet: args.sheet,
            context: this.context,
          }),
        }),
        content: new DynamicComponent({
          template: ExpertiseContentViewModel.TEMPLATE,
          viewModelFactory: (parent) => new ExpertiseContentViewModel({
            id: `${expertise.id}-header`,
            parent: parent,
            document: expertise,
            sheet: args.sheet,
            context: this.context,
          }),
        }),
      })
    };
    this.vmExpertises = new ListViewModel({
      id: "vmExpertises",
      parent: this,
      items: this.document.expertises.map(expertise => mapExpertiseToListItem(expertise)),
      separators: [
        new ListSeparator({
          getIndex: getSeparatorIndex.bind(this),
          separatorContent: new DynamicComponent({
            template: TEMPLATES.application.component.separator.horizontalLockedSeparator,
          }),
          tooltip: new ViewModelToolTipDefinition({
            localized: StringUtil.getLoca("system.item.expertise.lockedHint"),
          }),
          condition: () => getSeparatorIndex() > -1,
        }),
      ],
      toSearchableTerm: (listItem) => {
        const expertise = this.document.expertises.find(it => it.id === listItem.id);
        return expertise.name;
      },
      contextMenuOptions: [
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.item.expertise.add"),
          onClick: () => {
            const newExpertises = this.document.expertises.concat([
              new Expertise({
                owningDocument: this.document,
              }),
            ]);
            this.document.expertises = newExpertises;
          },
        }),
      ],
      itemContextMenuOptions: [
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.item.expertise.delete"),
          onClick: () => {
            // TODO #762 prompt confirm -> delete
          },
        }),
      ],
    });
    // Listen for expertise data changes and update the list accordingly.
    this._callbackId = this.document.onChange((propertyName, newValue) => {
      if (propertyName === "expertises") {
        this.vmExpertises.items = newValue.map(expertise => mapExpertiseToListItem(expertise));
      }
    });
  }

  /** @override */
  dispose() {
    this.document.offChange(this._callbackId);
    super.dispose();
  }

  /**
   * @returns {Number}
   * @private
   */
  #getMaximumAdvancementProgress() {
    return Skill.getAdvancementRequirement(this.document.level);
  }
}
