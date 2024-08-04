import { ACTOR_TYPES } from "../../../../../business/document/actor/actor-types.mjs"
import { ITEM_TYPES } from "../../../../../business/document/item/item-types.mjs"
import Ruleset from "../../../../../business/ruleset/ruleset.mjs"
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs"
import ButtonAddViewModel from "../../../../component/button-add/button-add-viewmodel.mjs"
import InfoBubble, { InfoBubbleAutoHidingTypes, InfoBubbleAutoShowingTypes } from "../../../../component/info-bubble/info-bubble.mjs"
import InputNumberSpinnerViewModel from "../../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import SortControlsViewModel, { SortingOption } from "../../../../component/sort-controls/sort-controls-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import IllnessListItemViewModel from "../../../item/illness/illness-list-item-viewmodel.mjs"
import InjuryListItemViewModel from "../../../item/injury/injury-list-item-viewmodel.mjs"
import MutationListItemViewModel from "../../../item/mutation/mutation-list-item-viewmodel.mjs"
import ScarListItemViewModel from "../../../item/scar/scar-list-item-viewmodel.mjs"
import ActorHealthStatesViewModel from "./actor-health-states-viewmodel.mjs"
import DeathsDoorViewModel from "./deaths-door/deaths-door-viewmodel.mjs"
import GritPointsViewModel from "./grit-points/grit-points-viewmodel.mjs"

/**
 * @extends ViewModel
 */
export default class ActorHealthViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_HEALTH; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isPC() { return this.document.type === ACTOR_TYPES.PC; }

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
  get modifiedMaxHp() { return this.document.health.modifiedMaxHp; }

  /**
   * @type {Number}
   * @readonly
   */
  get modifiedMaxExhaustion() { return this.document.health.modifiedMaxExhaustion; }

  /**
   * @type {Number}
   * @readonly
   */
  get modifiedMaxMagicStamina() { return this.document.health.modifiedMaxMagicStamina; }

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
  get maxInjuries() { return this.document.health.maxInjuries; }

  /**
   * @type {Number}
   * @readonly
   */
  get modifiedMaxInjuries() { return this.document.health.modifiedMaxInjuries; }

  /**
   * @type {String}
   * @readonly
   */
  get sortControlsTemplate() { return SortControlsViewModel.TEMPLATE; }

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
   * @type {String}
   * @readonly
   */
  get healthStatesTemplate() { return ActorHealthStatesViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get gritPointsTemplate() { return GritPointsViewModel.TEMPLATE; }

  /**
   * @type {String}
   * @readonly
   */
  get deathsDoorTemplate() { return DeathsDoorViewModel.TEMPLATE; }

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

    // HP
    this.vmMaxHp = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxHp",
      value: this.document.health.maxHP,
      isEditable: false,
    });
    this.vmMaxHpModifier = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxHpModifier",
      value: this.document.health.maxHpModifier,
      onChange: (_, newValue) => {
        this.document.health.maxHpModifier = newValue;
      },
    });
    this.vmHp = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmHp",
      value: this.document.health.HP,
      onChange: (_, newValue) => {
        this.document.health.HP = newValue;
      },
    });
    // Exhaustion
    this.vmMaxExhaustion = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxExhaustion",
      value: this.document.health.maxExhaustion,
      isEditable: false,
    });
    this.vmMaxExhaustionModifier = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxExhaustionModifier",
      value: this.document.health.maxExhaustionModifier,
      onChange: (_, newValue) => {
        this.document.health.maxExhaustionModifier = newValue;
      },
    });
    this.vmExhaustion = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmExhaustion",
      value: this.document.health.exhaustion,
      onChange: (_, newValue) => {
        this.document.health.exhaustion = newValue;
      },
      min: 0,
    });
    // Magic Stamina
    this.vmMaxMagicStamina = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxMagicStamina",
      value: this.document.health.maxMagicStamina.total,
      isEditable: false,
    });
    this.vmMaxMagicStaminaModifier = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxMagicStaminaModifier",
      value: this.document.health.maxMagicStaminaModifier,
      onChange: (_, newValue) => {
        this.document.health.maxMagicStaminaModifier = newValue;
      },
    });
    this.vmMagicStamina = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMagicStamina",
      value: this.document.health.magicStamina,
      onChange: (_, newValue) => {
        this.document.health.magicStamina = newValue;
      },
      min: 0,
    });

    // Injury
    this.vmMaxInjuriesModifier = new InputNumberSpinnerViewModel({
      parent: this,
      id: "vmMaxInjuriesModifier",
      value: this.document.health.maxInjuriesModifier,
      onChange: (_, newValue) => {
        this.document.health.maxInjuriesModifier = newValue;
      },
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
      parent: this,
      isEditable: args.isEditable ?? this.isEditable,
      id: "vmIllnessList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "illnesses",
      }),
      listItemViewModels: this.illnesses,
      listItemTemplate: IllnessListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddIllness",
        parent: this,
        target: this.document,
        isEditable: this.isEditable,
        creationType: ITEM_TYPES.ILLNESS,
        withDialog: true,
        localizedLabel: game.i18n.localize("system.character.health.illness.add.label"),
        localizedType: game.i18n.localize("system.character.health.illness.singular"),
      }),
    });

    // Prepare injuries list view models. 
    this.injuries = [];
    this.injuries = this._getInjuryViewModels();
    this.vmInjuryList = new SortableListViewModel({
      parent: this,
      isEditable: args.isEditable ?? this.isEditable,
      id: "vmInjuryList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "injuries",
      }),
      listItemViewModels: this.injuries,
      listItemTemplate: InjuryListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddInjury",
        parent: this,
        target: this.document,
        isEditable: this.isEditable,
        creationType: ITEM_TYPES.INJURY,
        withDialog: true,
        localizedLabel: game.i18n.localize("system.character.health.injury.add.label"),
        localizedType: game.i18n.localize("system.character.health.injury.singular"),
      }),
    });

    // Prepare mutations list view models. 
    this.mutations = [];
    this.mutations = this._getMutationViewModels();
    this.vmMutationList = new SortableListViewModel({
      parent: this,
      isEditable: args.isEditable ?? this.isEditable,
      id: "vmMutationList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "mutations",
      }),
      listItemViewModels: this.mutations,
      listItemTemplate: MutationListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddMutation",
        parent: this,
        target: this.document,
        isEditable: this.isEditable,
        creationType: ITEM_TYPES.MUTATION,
        withDialog: true,
        localizedLabel: game.i18n.localize("system.character.health.mutation.add.label"),
        localizedType: game.i18n.localize("system.character.health.mutation.singular"),
      }),
    });

    // Prepare scars list view models. 
    this.scars = [];
    this.scars = this._getScarViewModels();
    this.vmScarList = new SortableListViewModel({
      parent: this,
      isEditable: args.isEditable ?? this.isEditable,
      id: "vmScarList",
      indexDataSource: new DocumentListItemOrderDataSource({
        document: this.document,
        listName: "scars",
      }),
      listItemViewModels: this.scars,
      listItemTemplate: ScarListItemViewModel.TEMPLATE,
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddScar",
        parent: this,
        target: this.document,
        isEditable: this.isEditable,
        creationType: ITEM_TYPES.SCAR,
        withDialog: true,
        localizedLabel: game.i18n.localize("system.character.health.scar.add.label"),
        localizedType: game.i18n.localize("system.character.health.scar.singular"),
      }),
    });

    this.vmSortInjuries = new SortControlsViewModel({
      id: "vmSortInjuries",
      parent: this,
      options: this._getTreatableSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmInjuryList);
      },
    });

    this.vmSortIllnesses = new SortControlsViewModel({
      id: "vmSortIllnesses",
      parent: this,
      options: this._getTreatableSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmIllnessList);
      },
    });

    this.vmSortMutations = new SortControlsViewModel({
      id: "vmSortMutations",
      parent: this,
      options: this._getNameSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmMutationList);
      },
    });

    this.vmSortScars = new SortControlsViewModel({
      id: "vmSortScars",
      parent: this,
      options: this._getNameSortingOptions(),
      compact: true,
      onSort: (_, provideSortable) => {
        provideSortable(this.vmScarList);
      },
    });

    this.vmGritPoints = new GritPointsViewModel({
      id: "vmGritPoints",
      parent: this,
      document: this.document,
      isInCombatTracker: false,
    });

    if (this.isPC) {
      this.vmDeathsDoor = new DeathsDoorViewModel({
        id: "vmDeathsDoor",
        parent: this,
        document: this.document,
      });
    }
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

  /**
   * Returns the `SortingOption`s for the injury and illness lists. 
   * 
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getTreatableSortingOptions() {
    return [
      new SortingOption({
        iconHtml: '<i class="ico ico-tags-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.general.name.label"),
        sortingFunc: (a, b) => {
          return a.document.name.localeCompare(b.document.name);
        },
      }),
      new SortingOption({
        iconHtml: '<i class="fas fa-mortar-pestle pad-r-sm"></i>',
        localizedToolTip: game.i18n.localize("system.character.health.treatment"),
        sortingFunc: (a, b) => {
          return a.document.compareTreatment(b.document);
        },
      }),
    ];
  }

  /**
   * Returns the `SortingOption`s for the mutation and scar lists. 
   * 
   * @returns {Array<SortingOption>}
   * 
   * @private
   */
  _getNameSortingOptions() {
    return [
      new SortingOption({
        iconHtml: '<i class="ico ico-tags-solid dark"></i>',
        localizedToolTip: game.i18n.localize("system.general.name.label"),
        sortingFunc: (a, b) => {
          return a.document.name.localeCompare(b.document.name);
        },
      }),
    ];
  }
}
