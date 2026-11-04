import { TARGETING_TYPES } from "../../../../business/model/domain/const/targeting-types.mjs";
import ExpertiseDocument from "../../../../business/model/document/item/expertise-document.mjs";
import { LIST_ITEM_EXPANSION_MODES } from "../../../../business/setting/list-item-expansion-modes.mjs";
import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import VisibilityRule from "../../../model/visibility-rule.mjs";
import { ChoicesUtil } from "../../../util/choices-utility.mjs";
import { DropDownOption } from "../../component/button-dropdown/dropdown-option.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import GradedEffectListViewModel from "../../component/graded-effect/graded-effect-list-viewmodel.mjs";
import InputDropDownViewModel from "../../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputNumberSpinnerViewModel from "../../component/input-number-spinner/input-number-spinner-viewmodel.mjs";
import InputReferenceViewModel from "../../component/input-reference/input-reference-viewmodel.mjs";
import InputRichTextViewModel from "../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import ListItem from "../../component/list/list-item.mjs";
import ListSeparator from "../../component/list/list-separator.mjs";
import ListViewModel from "../../component/list/list-viewmodel.mjs";
import ConfirmableModalDialog from "../../dialog/confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ViewModel, { ViewModelToolTipDefinition } from "../../view-model/view-model.mjs";
import BaseItemContentViewModel from "../base/base-item-content-viewmodel.mjs";
import BaseItemHeaderViewModel from "../base/base-item-header-viewmodel.mjs";
import ExpertiseContentViewModel from "../expertise/expertise-content-viewmodel.mjs";
import ExpertiseHeaderViewModel from "../expertise/expertise-header-viewmodel.mjs";
import GameSystemSettings from "../../../../business/setting/game-system-settings.mjs";
import { GameSystemUserSettings } from "../../../../business/setting/game-system-user-settings.mjs";

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
   * @type {Array<ExpertiseDocument>}
   * @readonly
   */
  get lockedExpertises() {
    return this.document.expertises.filter(expertise => expertise.requiredLevel > this.document.level);
  }

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
        shouldBeHidden: () => !this.isEditable && this.document.targetingType.enabled,
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
   * @param {SkillDocument} args.document The represented transient document instance. 
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
        document: expertise,
        openSheet: async () => {
          if (ValidationUtil.isFunction(expertise.openSheet)) {
            return await expertise.openSheet(true);
          } else {
            game.strive.logger.warning("openSheet undefined");
          }
        },
        header: new DynamicComponent({
          template: BaseItemHeaderViewModel.TEMPLATE,
          viewModelFactory: (parent) => new ExpertiseHeaderViewModel({
            id: "header",
            parent: parent,
            document: expertise,
            sheet: args.sheet,
            onNameClick: () => {
              this.vmExpertises.toggleItemExpanded(expertise.id);
            },
          }),
        }),
        content: new DynamicComponent({
          template: BaseItemContentViewModel.TEMPLATE,
          viewModelFactory: (parent) => new ExpertiseContentViewModel({
            id: "content",
            parent: parent,
            document: expertise,
            sheet: args.sheet,
          }),
        }),
      })
    };

    let itemsInitiallyExpanded = false;
    const itemExpansionModeRaw = GameSystemSettings.get(GameSystemUserSettings.KEY_LIST_ITEM_EXPANSION_MODE);
    let itemExpansionMode = LIST_ITEM_EXPANSION_MODES.asArray().find(it => it.name === itemExpansionModeRaw) ?? LIST_ITEM_EXPANSION_MODES.window;
    if (!this.isEmbedded && itemExpansionModeRaw === LIST_ITEM_EXPANSION_MODES.inline.name) {
      itemExpansionMode = LIST_ITEM_EXPANSION_MODES.inline_locked;
      itemsInitiallyExpanded = true;
    }
    this.vmExpertises = new ListViewModel({
      id: "vmExpertises",
      parent: this,
      itemExpansionMode: itemExpansionMode,
      itemsInitiallyExpanded: itemsInitiallyExpanded,
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
          icon: "fas fa-plus",
          onClick: () => {
            const newExpertises = this.document.expertises.concat([
              new ExpertiseDocument({
                parentDocument: this.document,
                index: this.document.expertises.length,
              }),
            ]);
            this.document.expertises = newExpertises;
          },
        }),
        new DropDownOption({
          localizedValue: StringUtil.format(
            StringUtil.getLoca("system.general.sort.sortAscendingBy"),
            StringUtil.getLoca("system.item.expertise.name")
          ),
          icon: "ico ico-sort-asc",
          iconCssClass: "lg",
          onClick: () => {
            const newExpertises = this.document.expertises.concat([]);
            newExpertises.sort((a, b) => a.name.localeCompare(b.name));
            this.document.expertises = newExpertises;
          },
        }),
        new DropDownOption({
          localizedValue: StringUtil.format(
            StringUtil.getLoca("system.general.sort.sortDescendingBy"),
            StringUtil.getLoca("system.item.expertise.name")
          ),
          icon: "ico ico-sort-desc",
          iconCssClass: "lg",
          onClick: () => {
            const newExpertises = this.document.expertises.concat([]);
            newExpertises.sort((a, b) => b.name.localeCompare(a.name));
            this.document.expertises = newExpertises;
          },
        }),
        new DropDownOption({
          localizedValue: StringUtil.format(
            StringUtil.getLoca("system.general.sort.sortAscendingBy"),
            StringUtil.getLoca("system.item.expertise.level")
          ),
          icon: "ico ico-sort-asc",
          iconCssClass: "lg",
          onClick: () => {
            const newExpertises = this.document.expertises.concat([]);
            newExpertises.sort((a, b) => a.requiredLevel - b.requiredLevel);
            this.document.expertises = newExpertises;
          },
        }),
        new DropDownOption({
          localizedValue: StringUtil.format(
            StringUtil.getLoca("system.general.sort.sortDescendingBy"),
            StringUtil.getLoca("system.item.expertise.level")
          ),
          icon: "ico ico-sort-desc",
          iconCssClass: "lg",
          onClick: () => {
            const newExpertises = this.document.expertises.concat([]);
            newExpertises.sort((a, b) => b.requiredLevel - a.requiredLevel);
            this.document.expertises = newExpertises;
          },
        }),
      ],
      itemContextMenuOptions: [
        new DropDownOption({
          localizedValue: StringUtil.getLoca("system.item.expertise.delete"),
          icon: "fas fa-trash",
          onClick: async (item) => {
            const dialog = await new ConfirmableModalDialog({
              easyDismissal: true,
              title: StringUtil.getLoca("system.general.delete.confirm"),
              sections: [
                new DynamicComponent({
                  html: `<p class="font-size-md">${StringUtil.format(
                    StringUtil.getLoca("system.general.delete.confirmOf"),
                    item.document.name
                  )}</p>`,
                }),
              ],
            }).renderAndAwait();

            if (dialog.confirmed) {
              const newExpertises = this.document.expertises.concat([]);
              const index = this.document.expertises.findIndex(it => it.id === item.id);
              newExpertises.splice(index, 1);
              this.document.expertises = newExpertises;
            }
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
}
