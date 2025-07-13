import Expertise from "../../../../business/document/item/skill/expertise.mjs"
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs"
import GameSystemUserSettings from "../../../../business/setting/game-system-user-settings.mjs"
import { StringUtil } from "../../../../business/util/string-utility.mjs"
import { UuidUtil } from "../../../../business/util/uuid-utility.mjs"
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs"
import ButtonAddViewModel from "../../../component/button-add/button-add-viewmodel.mjs"
import ExpertiseCreationStrategy from "../../../component/button-add/expertise-creation-strategy.mjs"
import ButtonToggleVisibilityViewModel from "../../../component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs"
import ButtonViewModel from "../../../component/button/button-viewmodel.mjs"
import ListFooterViewModel from "../../../component/sortable-list/list-footer-viewmodel.mjs"
import { SortableListAddItemParams } from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import { LIST_ITEM_DETAIL_MODES } from "../base/base-list-item-viewmodel.mjs"
import ExpertiseListItemViewModel from "./expertise-list-item-viewmodel.mjs"

/**
 * @property {TransientSkill} document
 * * readonly
 */
export default class ExpertiseTableViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.EXPERTISE_TABLE; }

  /**
   * @type {Boolean}
   * @private
   */
  _isExpanded = true;
  /**
   * @type {Boolean}
   */
  get isExpanded() {
    return this._isExpanded;
  }
  set isExpanded(value) {
    this._isExpanded = value;
    
    const elements = document.querySelectorAll(`[${ButtonToggleVisibilityViewModel.ATTRIBUTE_VIS_GROUP}='${this.visGroupId}']`);
    
    // Synchronize visibilities. 
    this.vmFooter.vmToggleExpansion.value = value;
    if (value === true) { // Expanded
      this.vmFooter.vmToggleExpansion.element.parent().removeClass("hidden");
      this.vmHeaderButton.element.find(".expanded").removeClass("hidden");
      this.vmHeaderButton.element.find(".collapsed").addClass("hidden");
      for (const element of elements) {
        element.classList.remove("hidden");
      }
    } else { // Collapsed
      this.vmFooter.vmToggleExpansion.element.parent().addClass("hidden");
      this.vmHeaderButton.element.find(".expanded").addClass("hidden");
      this.vmHeaderButton.element.find(".collapsed").removeClass("hidden");
      for (const element of elements) {
        element.classList.add("hidden");
      }
    }

    // Immediately write view state. 
    this.writeViewState();
  }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get attackTypeOptions() { return ATTACK_TYPES.asChoices(); }

  /**
   * @type {Array<ChoiceOption>}
   * @readonly
   */
  get damageTypeOptions() { return DAMAGE_TYPES.asChoices(); }

  /**
   * @returns {Boolean}
   * @readonly
   */
  get hasLockedExpertises() { return (this.lockedExpertises.length > 0); }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientSkill} args.document
   * @param {Boolean | undefined} args.expertisesInitiallyVisible
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;

    this.localizedTitle = game.i18n.localize("system.character.skill.expertise.plural");
    this.visGroupId = UuidUtil.createUUID();
    this.addItemParams = new SortableListAddItemParams({
      creationStrategy: new ExpertiseCreationStrategy({
        target: this.document,
      }),
      localizedLabel: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.skill.expertise.singular"),
      ),
      localizedToolTip: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.skill.expertise.singular"),
      ),
    });
    this.listItemTemplate = ExpertiseListItemViewModel.TEMPLATE;
    
    // Group Expertises. 
    this._updateExpertiseViewModels();

    this.registerViewStateProperty("_isExpanded");

    this.vmHeaderButton = new ButtonViewModel({
      id: "vmHeaderButton",
      parent: this,
      onClick: async () => {
        this.isExpanded = !this.isExpanded;
      },
      isEditable: true, // Even those without editing right should be able to see nested content. 
    });
    if (this.isEditable === true) {
      this.vmAddItem = new ButtonAddViewModel({
        id: "vmAddItem",
        parent: this,
        creationStrategy: this.addItemParams.creationStrategy,
        localizedToolTip: this.addItemParams.localizedToolTip,
        onClick: (event, data) => {
          if (ValidationUtil.isDefined(this.addItemParams.onItemAdded)) {
            this.addItemParams.onItemAdded(event, data);
          }
        },
      });
    }

    this.vmFooter = new ListFooterViewModel({
      id: "vmFooter",
      parent: this,
      isCollapsible: true,
      addItemParams: [this.addItemParams],
      localizedCollapseToolTip: StringUtil.format2(
        game.i18n.localize("system.general.expansion.collapseOf"),
        { s: StringUtil.format2(
          game.i18n.localize("system.character.skill.expertise.expertisesOf"),
          { skill: this.document.name, }
        ) }
      ),
      onExpansionToggled: () => {
        this.isExpanded = !this.isExpanded;
      },
    });
    this.vmLockedExpertisesSeparator = new ViewModel({
      id: "vmLockedExpertisesSeparator",
      parent: this,
      localizedToolTip: game.i18n.localize("system.character.skill.expertise.lockedExplanation"),
    });
  }

  /**
   * Updates the data of this view model. 
   * 
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat.
   * * Default `false`. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document.
   * * Default `false`. 
   * 
   * @override
   */
  update(args = {}) {
    this._updateExpertiseViewModels();

    super.update(args);
  }
  
  /**
   * @private
   */
  _updateExpertiseViewModels() {
    const expertiseSortFunc = (a, b) => {
      if (a.requiredLevel < b.requiredLevel) {
        return -1;
      } else if (a.requiredLevel == b.requiredLevel) {
        return a.name.localeCompare(b.name);
      } else {
        return 1;
      }
    };

    const documentHasOwner = ValidationUtil.isDefined(this.document.owningDocument);
    const level = documentHasOwner ? parseInt(this.document.modifiedLevel) : 999999;
    const unlockedExpertises = this.document.expertises.filter(it => parseInt(it.requiredLevel) <= level)
    const sortedUnlockedExpertises = unlockedExpertises.sort(expertiseSortFunc);
    this.unlockedExpertises = this._getExpertiseViewModels(sortedUnlockedExpertises, true);

    const showLockedExpertises = new GameSystemUserSettings().get(GameSystemUserSettings.KEY_TOGGLE_UNUSABLE_EXPERTISE_VISIBILITY);
    if (showLockedExpertises === true) {
      const lockedExpertises = this.document.expertises.filter(it => parseInt(it.requiredLevel) > level)
      const sortedLockedExpertises = lockedExpertises.sort(expertiseSortFunc);
      this.lockedExpertises = this._getExpertiseViewModels(sortedLockedExpertises, false);
    } else {
      this.lockedExpertises = [];
    }
  }

  /**
   * @param {Array<Expertise>} expertises
   * @param {Boolean} isExpanded
   * 
   * @returns {Array<ExpertiseListItemViewModel>}
   * 
   * @private
   */
  _getExpertiseViewModels(expertises, isExpanded) {
    const result = [];
    for (const expertise of expertises) {
      const vm = new ExpertiseListItemViewModel({
        id: expertise.id,
        parent: this,
        document: expertise,
        isExpanded: isExpanded,
        detailMode: isExpanded ? LIST_ITEM_DETAIL_MODES.FULL : LIST_ITEM_DETAIL_MODES.MINIMAL_COLLAPSED,
      });
      result.push(vm);
      this[vm._id] = vm;
    }
    return result;
  }
}
