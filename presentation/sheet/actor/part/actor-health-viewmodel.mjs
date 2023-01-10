import Ruleset from "../../../../business/ruleset/ruleset.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import IllnessListItemViewModel from "../../item/illness/illness-list-item-viewmodel.mjs"
import InjuryListItemViewModel from "../../item/injury/injury-list-item-viewmodel.mjs"
import MutationListItemViewModel from "../../item/mutation/mutation-list-item-viewmodel.mjs"

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
   * @type {Boolean}
   * @readonly
   */
  get isToughnessTestRequired() { return new Ruleset().isToughnessTestRequired(this.document.document); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
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
    const factory = new ViewModelFactory();

    this.vmNsMaxHp = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMaxHp",
      propertyOwner: thiz.document,
      propertyPath: "health.maxHP",
      isEditable: false,
    });
    this.vmNsHp = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsHp",
      propertyOwner: thiz.document,
      propertyPath: "health.HP",
    });
    this.vmNsMaxExhaustion = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMaxExhaustion",
      propertyOwner: thiz.document,
      propertyPath: "health.maxExhaustion",
      isEditable: false,
    });
    this.vmNsExhaustion = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsExhaustion",
      propertyOwner: thiz.document,
      propertyPath: "health.exhaustion",
      min: 0,
    });
    this.vmNsMagicStamina = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMagicStamina",
      propertyOwner: thiz.document,
      propertyPath: "health.magicStamina",
      min: 0,
    });
    this.vmNsMaxMagicStamina = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMaxMagicStamina",
      propertyOwner: thiz.document,
      propertyPath: "health.maxMagicStamina.total",
      isEditable: false,
    });
    this.vmNsMaxInjuries = factory.createVmNumberSpinner({
      parent: thiz,
      id: "vmNsMaxInjuries",
      propertyOwner: thiz.document,
      propertyPath: "health.maxInjuries",
      isEditable: false,
      min: 1,
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
      vmBtnAddItem: factory.createVmBtnAdd({
        id: "vmBtnAddIllness",
        target: thiz.document,
        creationType: "illness",
        withDialog: true,
        localizableLabel: "ambersteel.character.health.illness.add.label",
        localizableType: "ambersteel.character.health.illness.singular",
        localizableDialogTitle: "ambersteel.character.health.illness.add.query",
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
      vmBtnAddItem: factory.createVmBtnAdd({
        id: "vmBtnAddInjury",
        target: thiz.document,
        creationType: "injury",
        withDialog: true,
        localizableLabel: "ambersteel.character.health.injury.add.label",
        localizableType: "ambersteel.character.health.injury.singular",
        localizableDialogTitle: "ambersteel.character.health.injury.add.query",
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
      vmBtnAddItem: factory.createVmBtnAdd({
        id: "vmBtnAddMutation",
        target: thiz.document,
        creationType: "mutation",
        withDialog: true,
        localizableLabel: "ambersteel.character.health.mutation.add.label",
        localizableType: "ambersteel.character.health.mutation.singular",
        localizableDialogTitle: "ambersteel.character.health.mutation.add.query",
      }),
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
    for (const existingIllness of this.illnesses) {
      const cull = newIllnesses.find(it => it._id === existingIllness._id) === undefined;
      if (cull === true) {
        existingIllness.parent = undefined;
      }
    }
    this.illnesses = newIllnesses;
    
    // Injuries
    const newInjuries = this._getInjuryViewModels();
    for (const existingInjury of this.injuries) {
      const cull = newInjuries.find(it => it._id === existingInjury._id) === undefined;
      if (cull === true) {
        existingInjury.parent = undefined;
      }
    }
    this.injuries = newInjuries;
    
    // Mutations
    const newMutations = this._getMutationViewModels();
    for (const existingMutation of this.mutations) {
      const cull = newMutations.find(it => it._id === existingMutation._id) === undefined;
      if (cull === true) {
        existingMutation.parent = undefined;
      }
    }
    this.mutations = newMutations;

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
    
    return updates;
  }

  /**
   * @returns {Array<IllnessListItemViewModel>}
   * 
   * @private
   */
  _getIllnessViewModels() {
    const result = [];
    
    const illnesses = this.document.health.illnesses;
    for (const illness of illnesses) {
      let vm = this.illnesses.find(it => it._id === illness.id);
      if (vm === undefined) {
        vm = new IllnessListItemViewModel({
          id: illness.id,
          document: illness,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
        });
      }
      result.push(vm);
    }

    return result;
  }

  /**
   * @returns {Array<InjuryListItemViewModel>}
   * 
   * @private
   */
  _getInjuryViewModels() {
    const result = [];
    
    const injuries = this.document.health.injuries;
    for (const injury of injuries) {
      let vm = this.injuries.find(it => it._id === injury.id);
      if (vm === undefined) {
        vm = new InjuryListItemViewModel({
          id: injury.id,
          document: injury,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
        });
      }
      result.push(vm);
    }

    return result;
  }

  /**
   * @returns {Array<MutationListItemViewModel>}
   * 
   * @private
   */
  _getMutationViewModels() {
    const result = [];
    
    const mutations = this.document.health.mutations;
    for (const mutation of mutations) {
      let vm = this.mutations.find(it => it._id === mutation.id);
      if (vm === undefined) {
        vm = new MutationListItemViewModel({
          id: mutation.id,
          document: mutation,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
        });
      }
      result.push(vm);
    }

    return result;
  }
}