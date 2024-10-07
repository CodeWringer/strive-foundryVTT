import { ITEM_TYPES } from "../../../../business/document/item/item-types.mjs"
import { DAMAGE_TYPES } from "../../../../business/ruleset/damage-types.mjs"
import { ATTACK_TYPES } from "../../../../business/ruleset/skill/attack-types.mjs"
import { StringUtil } from "../../../../business/util/string-utility.mjs"
import { UuidUtil } from "../../../../business/util/uuid-utility.mjs"
import { ValidationUtil } from "../../../../business/util/validation-utility.mjs"
import ButtonAddViewModel from "../../../component/button-add/button-add-viewmodel.mjs"
import ButtonToggleVisibilityViewModel from "../../../component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
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
   * @type {Boolean}
   * @private
   */
  _isExpanded = false;
  /**
   * @type {Boolean}
   */
  get isExpanded() {
    return this._isExpanded;
  }
  set isExpanded(value) {
    this._isExpanded = value;

    // Synchronize the toggle buttons. 
    this.vmToggleExpansion1.value = value;
    this.vmToggleExpansion2.value = value;
    // Hide the second expansion toggle button if the expertise list is currently hidden. 
    if (value === true) {
      this.vmToggleExpansion2.element.parent().removeClass("hidden");
    } else {
      this.vmToggleExpansion2.element.parent().addClass("hidden");
    }

    // Immediately write view state. 
    this.writeViewState();
  }

  /**
   * @type {String}
   * @readonly
   */
  visGroupId = undefined;

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
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientSkill} args.document
   * @param {String | undefined} args.visGroupId
   * @param {Boolean | undefined} args.expertisesInitiallyVisible
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;
    this.visGroupId = args.visGroupId ?? UuidUtil.createUUID();
    this._isExpanded = args.expertisesInitiallyVisible ?? false;
    
    this.registerViewStateProperty("_isExpanded");

    // Child view models. 
    this.contextTemplate = "expertise-table";
    const thiz = this;

    this.vmAddExpertise = new ButtonAddViewModel({
      id: "vmAddExpertise",
      parent: this,
      target: this.document,
      creationType: ITEM_TYPES.EXPERTISE,
      localizedToolTip: StringUtil.format(
        game.i18n.localize("system.general.add.addType"),
        game.i18n.localize("system.character.skill.expertise.singular"),
      ),
      localizedType: game.i18n.localize("system.character.skill.expertise.singular"),
    });

    this.expertises = [];
    this.expertises = this._getExpertiseViewModels();

    this.vmExpertises = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmExpertises",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "expertises",
      }),
      listItemViewModels: this.expertises,
      listItemTemplate: ExpertiseListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAdd",
        parent: this,
        target: thiz.document,
        isEditable: this.isEditable,
        creationType: ITEM_TYPES.EXPERTISE,
        withDialog: false,
        localizedLabel: StringUtil.format(
          game.i18n.localize("system.general.add.addType"),
          game.i18n.localize("system.character.skill.expertise.singular"),
        ),
        localizedType: game.i18n.localize("system.character.skill.expertise.singular"),
      }),
    });

    this.vmToggleExpansion1 = new ButtonToggleVisibilityViewModel({
      parent: thiz,
      id: "vmToggleExpansion1",
      isEditable: true,
      value: this.isExpanded,
      iconInactive: '<i class="fas fa-angle-double-down"></i>',
      iconActive: '<i class="fas fa-angle-double-up"></i>',
      visGroup: thiz.visGroupId,
      onClick: async (event, data) => {
        this.isExpanded = !this.isExpanded;
      },
    });
    this.vmToggleExpansion2 = new ButtonToggleVisibilityViewModel({
      parent: thiz,
      id: "vmToggleExpansion2",
      isEditable: true,
      value: this.isExpanded,
      iconInactive: '<i class="fas fa-angle-double-down"></i>',
      iconActive: '<i class="fas fa-angle-double-up"></i>',
      visGroup: thiz.visGroupId,
      onClick: async (event, data) => {
        this.isExpanded = !this.isExpanded;
      },
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
      isEditable: args.isEditable ?? thiz.isEditable,
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
        isEditable: this.isEditable,
        isSendable: this.isSendable,
        isOwner: this.isOwner,
        document: expertise,
        isExpanded: true,
      });
      result.push(vm);
      this[vm._id] = vm;
    }
    return result;
  }
}
