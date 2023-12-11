import Ruleset from "../../../../../business/ruleset/ruleset.mjs"
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs"
import ButtonAddViewModel from "../../../../component/button-add/button-add-viewmodel.mjs"
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../../../../component/info-bubble/info-bubble.mjs"
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import IllnessListItemViewModel from "../../../item/illness/illness-list-item-viewmodel.mjs"
import InjuryListItemViewModel from "../../../item/injury/injury-list-item-viewmodel.mjs"
import MutationListItemViewModel from "../../../item/mutation/mutation-list-item-viewmodel.mjs"
import ScarListItemViewModel from "../../../item/scar/scar-list-item-viewmodel.mjs"
import ActorHealthStatesViewModel from "./actor-health-states-viewmodel.mjs"

/**
 * @extends ViewModel
 */
export default class ActorHealthViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_HEALTH; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Number}
   * @readonly
   */
  get injuryCount() { return this.document.health.injuries.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get illnessCount() { return this.document.health.illnesses.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get mutationCount() { return this.document.health.mutations.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get scarCount() { return this.document.health.scars.length; }

  /**
   * @type {Number}
   * @readonly
   */
  get maxHP() { return this.document.health.maxHP; }

  /**
   * @type {Number}
   * @readonly
   */
  get maxExhaustion() { return this.document.health.maxExhaustion; }

  /**
   * @type {Number}
   * @readonly
   */
  get maxMagicStamina() { return this.document.health.maxMagicStamina.total; }

  /**
   * @type {Number}
   * @readonly
   */
  get maxInjuryCount() { return this.document.health.maxInjuries; }

  /**
   * @type {Array<IllnessListItemViewModel>}
   * @readonly
   */
  illnesses = [];

  /**
   * @type {Array<InjuryViewModel>}
   * @readonly
   */
  injuries = [];

  /**
   * @type {Array<MutationViewModel>}
   * @readonly
   */
  mutations = [];

  /**
   * @type {Array<ScarListItemViewModel>}
   * @readonly
   */
  scars = [];

  /**
   * @type {Boolean}
   * @readonly
   */
  get isToughnessTestRequired() { return new Ruleset().isToughnessTestRequired(this.document.document); }
  
  /**
   * Returns `true`, if the character is near death. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get isDeathNear() { return this.injuryCount >= this.maxInjuryCount; }
  
  /**
   * @type {String}
   * @readonly
   */
  get healthStatesTemplate() { return ActorHealthStatesViewModel.TEMPLATE; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextType = args.contextType ?? "actor-health";

    const thiz = this;

    this.vmNsHp = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsHp",
      value: thiz.document.health.HP,
      onChange: (_, newValue) => {
        thiz.document.health.HP = newValue;
      },
    });
    this.vmNsExhaustion = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsExhaustion",
      value: thiz.document.health.exhaustion,
      onChange: (_, newValue) => {
        thiz.document.health.exhaustion = newValue;
      },
      min: 0,
    });
    this.vmNsMagicStamina = new InputNumberSpinnerViewModel({
      parent: thiz,
      id: "vmNsMagicStamina",
      value: thiz.document.health.magicStamina,
      onChange: (_, newValue) => {
        thiz.document.health.magicStamina = newValue;
      },
      min: 0,
    });
    this.vmHealthStates = new ActorHealthStatesViewModel({
      id: "vmHealthStates",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      document: this.document,
    });

    // Prepare illnesses list view models. 
    this.illnesses = [];
    this.illnesses = this._getIllnessViewModels();
    this.vmIllnessList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmIllnessList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "illnesses",
      }),
      listItemViewModels: this.illnesses,
      listItemTemplate: TEMPLATES.ILLNESS_LIST_ITEM,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddIllness",
        parent: this,
        target: thiz.document,
        isEditable: this.isEditable,
        creationType: "illness",
        withDialog: true,
        localizedLabel: game.i18n.localize("ambersteel.character.health.illness.add.label"),
        localizedType: game.i18n.localize("ambersteel.character.health.illness.singular"),
      }),
    });

    // Prepare injuries list view models. 
    this.injuries = [];
    this.injuries = this._getInjuryViewModels();
    this.vmInjuryList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmInjuryList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "injuries",
      }),
      listItemViewModels: this.injuries,
      listItemTemplate: TEMPLATES.INJURY_LIST_ITEM,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddInjury",
        parent: this,
        target: thiz.document,
        isEditable: this.isEditable,
        creationType: "injury",
        withDialog: true,
        localizedLabel: game.i18n.localize("ambersteel.character.health.injury.add.label"),
        localizedType: game.i18n.localize("ambersteel.character.health.injury.singular"),
      }),
    });

    // Prepare mutations list view models. 
    this.mutations = [];
    this.mutations = this._getMutationViewModels();
    this.vmMutationList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmMutationList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "mutations",
      }),
      listItemViewModels: this.mutations,
      listItemTemplate: TEMPLATES.MUTATION_LIST_ITEM,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddMutation",
        parent: this,
        target: thiz.document,
        isEditable: this.isEditable,
        creationType: "mutation",
        withDialog: true,
        localizedLabel: game.i18n.localize("ambersteel.character.health.mutation.add.label"),
        localizedType: game.i18n.localize("ambersteel.character.health.mutation.singular"),
      }),
    });

    // Prepare scars list view models. 
    this.scars = [];
    this.scars = this._getScarViewModels();
    this.vmScarList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmScarList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "scars",
      }),
      listItemViewModels: this.scars,
      listItemTemplate: ScarListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddScar",
        parent: this,
        target: thiz.document,
        isEditable: this.isEditable,
        creationType: "scar",
        withDialog: true,
        localizedLabel: game.i18n.localize("ambersteel.character.health.scar.add.label"),
        localizedType: game.i18n.localize("ambersteel.character.health.scar.singular"),
      }),
    });
  }
  
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    
    const composition = new Ruleset().getCharacterMaximumMagicStamina(this.document.document).components
      .map(component => {
        return `${game.i18n.localize(component.localizableName)} ${component.value}`;
      }).join(" + ");
    this.maxMagicStaminaInfoBubble = new InfoBubble({
      html: html,
      map: [
        { element: html.find(`#${this.id}-max-magic-stamina-info`), text: composition },
      ],
      autoShowType: InfoBubbleAutoShowingTypes.MOUSE_ENTER,
      autoHideType: InfoBubbleAutoHidingTypes.MOUSE_LEAVE,
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
    // Illnesses
    const newIllnesses = this._getIllnessViewModels();
    this._cullObsolete(this.illnesses, newIllnesses);
    this.illnesses = newIllnesses;
    
    // Injuries
    const newInjuries = this._getInjuryViewModels();
    this._cullObsolete(this.injuries, newInjuries);
    this.injuries = newInjuries;
    
    // Mutations
    const newMutations = this._getMutationViewModels();
    this._cullObsolete(this.mutations, newMutations);
    this.mutations = newMutations;
    
    // Scars
    const newScars = this._getScarViewModels();
    this._cullObsolete(this.scars, newScars);
    this.scars = newScars;

    super.update(args);
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmIllnessList, {
      ...updates.get(this.vmIllnessList),
      listItemViewModels: this.illnesses,
    });
    updates.set(this.vmInjuryList, {
      ...updates.get(this.vmInjuryList),
      listItemViewModels: this.injuries,
    });
    updates.set(this.vmMutationList, {
      ...updates.get(this.vmMutationList),
      listItemViewModels: this.mutations,
    });
    updates.set(this.vmScarList, {
      ...updates.get(this.vmScarList),
      listItemViewModels: this.scars,
    });
    
    return updates;
  }

  /**
   * @returns {Array<IllnessListItemViewModel>}
   * 
   * @private
   */
  _getIllnessViewModels() {
    return this._getViewModels(
      this.document.health.illnesses, 
      this.illnesses,
      (args) => { return new IllnessListItemViewModel(args); }
    );
  }
  
  /**
   * @returns {Array<InjuryListItemViewModel>}
   * 
   * @private
   */
  _getInjuryViewModels() {
    return this._getViewModels(
      this.document.health.injuries, 
      this.injuries,
      (args) => { return new InjuryListItemViewModel(args); }
    );
  }
  
  /**
   * @returns {Array<MutationListItemViewModel>}
   * 
   * @private
   */
  _getMutationViewModels() {
    return this._getViewModels(
      this.document.health.mutations, 
      this.mutations,
      (args) => { return new MutationListItemViewModel(args); }
    );
  }
  
  /**
   * @returns {Array<ScarListItemViewModel>}
   * 
   * @private
   */
  _getScarViewModels() {
    return this._getViewModels(
      this.document.health.scars, 
      this.scars,
      (args) => { return new ScarListItemViewModel(args); }
    );
  }
}