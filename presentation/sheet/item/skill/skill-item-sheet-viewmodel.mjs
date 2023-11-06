import { SKILL_TAGS } from "../../../../business/tags/system-tags.mjs";
import { ATTRIBUTES } from "../../../../business/ruleset/attribute/attributes.mjs";
import SkillPrerequisite from "../../../../business/ruleset/skill/skill-prerequisite.mjs";
import { isDefined } from "../../../../business/util/validation-utility.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs";
import ChoiceAdapter from "../../../component/input-choice/choice-adapter.mjs";
import InputTagsViewModel from "../../../component/input-tags/input-tags-viewmodel.mjs";
import SimpleListItemViewModel from "../../../component/simple-list/simple-list-item-viewmodel.mjs";
import SimpleListViewModel from "../../../component/simple-list/simple-list-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import SkillAbilityTableViewModel from "../skill-ability/skill-ability-table-viewmodel.mjs"
import SkillPrerequisiteListItemViewModel from "./skill-prerequisite-list-item-viewmodel.mjs";
import { querySkillConfiguration } from "./skill-utils.mjs";
import SkillViewModel from "./skill-viewmodel.mjs";
import { setNestedPropertyValue } from "../../../../business/util/property-utility.mjs";

export default class SkillItemSheetViewModel extends SkillViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ITEM_SHEET; }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attributeOptions() { return ATTRIBUTES.asChoices(); }

  /**
   * Returns true, if the skill ability list should be visible. 
   * @type {Boolean}
   * @readonly
   */
  get isSkillAbilityListVisible() { return (this.isEditable === true) || this.document.abilities.length !== 0 }

  /**
   * @type {String}
   * @readonly
   */
  get prerequisiteListItemTemplate() { return SkillPrerequisiteListItemViewModel.TEMPLATE; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * 
   * @param {TransientSkill} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {String | undefined} args.visGroupId
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.contextTemplate = args.contextTemplate ?? "skill-item-sheet";

    // Child view models. 
    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmImg = factory.createVmImg({
      parent: thiz,
      id: "vmImg",
      propertyOwner: thiz.document,
      propertyPath: "img",
    });
    this.vmTfName = factory.createVmTextField({
      parent: thiz,
      id: "vmTfName",
      propertyOwner: thiz.document,
      propertyPath: "name",
      placeholder: "ambersteel.general.name",
    });
    this.vmBtnEdit = new ButtonViewModel({
      id: "vmBtnEdit",
      parent: this,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      target: this.document,
      localizedTooltip: game.i18n.localize("ambersteel.general.edit"),
      onClick: async () => {
        const delta = await querySkillConfiguration(this.document);
        if (delta !== undefined) {
          this.document.headState = delta.headState;
        }
      },
    });
    this.vmBtnSendToChat = factory.createVmBtnSendToChat({
      parent: thiz,
      id: "vmBtnSendToChat",
      target: thiz.document,
      isEditable: thiz.isEditable || thiz.isGM,
    });
    this.vmDdRelatedAttribute = new InputDropDownViewModel({
      id: "vmDdRelatedAttribute",
      parent: thiz,
      options: thiz.attributeOptions,
      onChange: (_, newValue) => {
        setNestedPropertyValue(thiz.document, "relatedAttribute", newValue);
      },
      adapter: new ChoiceAdapter({
        toChoiceOption(obj) {
          if (isDefined(obj) === true) {
            return ATTRIBUTES.asChoices().find(it => it.value === obj.name);
          } else {
            return ATTRIBUTES.asChoices().find(it => it.value === "none");
          }
        },
        fromChoiceOption(option) {
          return ATTRIBUTES[option.value];
        }
      }),
    });
    this.vmTfCategory = factory.createVmTextField({
      parent: thiz,
      id: "vmTfCategory",
      propertyOwner: thiz.document,
      propertyPath: "category",
      placeholder: "ambersteel.general.category",
    });
    this.vmRtDescription = factory.createVmRichText({
      parent: thiz,
      id: "vmRtDescription",
      propertyOwner: thiz.document,
      propertyPath: "description",
    });
    this.vmSkillAbilityTable = new SkillAbilityTableViewModel({
      id: "vmSkillAbilityTable",
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      isOwner: thiz.isOwner,
      document: thiz.document,
      skillAbilitiesInitiallyVisible: true,
      visGroupId: thiz.visGroupId,
    });
    this.vmTags = new InputTagsViewModel({
      id: "vmTags",
      parent: this,
      propertyPath: "tags",
      propertyOwner: this.document,
      isEditable: this.isEditable,
      systemTags: SKILL_TAGS.asArray(),
    });

    this.prerequisiteViewModels = this._getPrerequisiteViewModels();

    this.vmPrerequisiteList = new SimpleListViewModel({
      id: "vmPrerequisiteList",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      contentItemViewModels: this.prerequisiteViewModels,
      contentItemTemplate: this.prerequisiteListItemTemplate,
      onAddClick: this._onClickAddPrerequisite.bind(this),
      onRemoveClick: this._onClickRemovePrerequisite.bind(this),
      isItemAddable: true,
      isItemRemovable: true,
      localizedAddLabel: game.i18n.localize("ambersteel.general.add"),
    });
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmBtnSendToChat, {
      ...updates.get(this.vmBtnSendToChat),
      isEditable: this.isEditable || this.isGM,
    });

    return updates;
  }

  /**
   * @returns {Array<SkillPrerequisiteListItemViewModel>}
   * 
   * @private
   */
  _getPrerequisiteViewModels() {
    const result = [];
    const thiz = this;

    const prerequisites = this.document.prerequisites;
    for (let index = 0; index < prerequisites.length; index++) {
      const prerequisite = prerequisites[index];

      const vm = new SkillPrerequisiteListItemViewModel({
        id: `vmPrerequisite${index}`,
        isEditable: this.isEditable,
        stateId: prerequisite.id,
        stateName: prerequisite.name,
        stateMinimumLevel: (prerequisite.minimumLevel ?? 0),
        onChange: (state) => {
          thiz._updatePrerequisitesFromViewModels();
        }
      });
      result.push(vm);
    }
    return result;
  }

  /**
   * Event handler for when a new skill prerequisite is added. 
   * 
   * @private
   */
  _onClickAddPrerequisite() {
    const prerequisites = this.document.prerequisites.concat([
      new SkillPrerequisite()
    ]);
    this.document.prerequisites = prerequisites;
  }

  /**
   * Event handler for when a skill prerequisite is to be removed. 
   * 
   * @param {SimpleListItemViewModel} viewModel
   * 
   * @private
   */
  _onClickRemovePrerequisite(viewModel) {
    const index = this.prerequisiteViewModels.indexOf(viewModel.itemViewModel);
    const safeCopy = this.document.prerequisites.concat([]);
    safeCopy.splice(index, 1);
    this.document.prerequisites = safeCopy;
  }

  /**
   * Updates the remote prerequisites array with the states gathered 
   * from `this.prerequisiteViewModels`. 
   * 
   * @private
   */
  _updatePrerequisitesFromViewModels() {
    const prerequisites = this.prerequisiteViewModels.map(viewModel => 
      viewModel.state
    );
    this.document.prerequisites = prerequisites;
  }
}
