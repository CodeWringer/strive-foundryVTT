import { ITEM_TYPES } from "../../../../business/document/item/item-types.mjs"
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs"
import { StringUtil } from "../../../../business/util/string-utility.mjs"
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs"
import { SortingOption } from "../../../component/sort-controls/sort-controls-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel, { SortableListAddItemParams, SortableListSortParams } from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import ExpertiseListItemViewModel from "./expertise-list-item-viewmodel.mjs"

export default class ExpertiseTableViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.EXPERTISE_TABLE; }

  /**
   * @type {TransientSkill}
   * @readonly
   */
  document = undefined;

  /**
   * Pass-through of the nested sortable list's `isExpanded` property. 
   * 
   * @type {Boolean}
   */
  get isExpanded() {
    return this.vmExpertises.isExpanded;
  }
  set isExpanded(value) {
    this.vmExpertises.isExpanded = value;
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
   * @type {Array<ExpertiseListItemViewModel>}
   * @readonly
   */
  expertises = [];

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
    
    this.expertises = this._getExpertiseViewModels();

    this.vmExpertises = new SortableListViewModel({
      id: "vmExpertises",
      parent: this,
      isCollapsible: true,
      isExpanded: args.expertisesInitiallyVisible ?? false,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "expertises",
      }),
      listItemViewModels: this.expertises,
      listItemTemplate: ExpertiseListItemViewModel.TEMPLATE,
      localizedTitle: game.i18n.localize("system.character.skill.expertise.plural"),
      headerLevel: 3,
      addItemParams: new SortableListAddItemParams({
        target: this.document,
        creationType: ITEM_TYPES.EXPERTISE,
        withDialog: false,
        localizedLabel: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.expertise.singular"),
        ),
        localizedToolTip: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.expertise.singular"),
        ),
        localizedType: game.i18n.localize("system.character.skill.expertise.singular"),
      }),
      sortParams: new SortableListSortParams({
        options: [
          new SortingOption({
            iconHtml: '<i class="ico ico-tags-solid dark"></i>',
            localizedToolTip: game.i18n.localize("system.general.name.label"),
            sortingFunc: (a, b) => {
              return a.document.name.localeCompare(b.document.name);
            },
          }),
          new SortingOption({
            iconHtml: '<i class="ico ico-level-solid dark"></i>',
            localizedToolTip: game.i18n.localize("system.character.advancement.level"),
            sortingFunc: (a, b) => {
              return a.document.compareRequiredLevel(b.document);
            },
          }),
        ],
        compact: true,
      })
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
    this.expertises = this._getExpertiseViewModels();

    super.update(args);
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmExpertises, {
      ...updates.get(this.vmExpertises),
      listItemViewModels: this.expertises,
      isEditable: args.isEditable ?? this.isEditable,
    });
    
    return updates;
  }

  /**
   * @returns {Array<ExpertiseListItemViewModel>}
   * 
   * @private
   */
  _getExpertiseViewModels() {
    const result = [];
    const expertises = this.document.expertises;
    for (const expertise of expertises) {
      const vm = new ExpertiseListItemViewModel({
        id: expertise.id,
        parent: this,
        document: expertise,
        isExpanded: true, // Expertises are expanded by default, so their content is harder to overlook. 
      });
      result.push(vm);
      this[vm._id] = vm;
    }
    return result;
  }
}
