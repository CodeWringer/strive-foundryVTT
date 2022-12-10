import Ruleset from "../../../../business/ruleset/ruleset.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs";
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs";
import SheetViewModel from "../../../view-model/sheet-view-model.mjs";
import IllnessListItemViewModel from "../../item/illness/illness-list-item-viewmodel.mjs";
import InjuryListItemViewModel from "../../item/injury/injury-list-item-viewmodel.mjs";
import MutationListItemViewModel from "../../item/mutation/mutation-list-item-viewmodel.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class ActorHealthViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_HEALTH; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /** @override */
  get entityId() { return this.actor.id; }

  /**
   * @type {Number}
   * @readonly
   */
  get injuryCount() { return this.actor.getInjuries().length; }

  /**
   * @type {Number}
   * @readonly
   */
  get illnessCount() { return this.actor.getIllnesses().length; }

  /**
   * @type {Number}
   * @readonly
   */
  get mutationCount() { return this.actor.getMutations().length; }

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
  get isToughnessTestRequired() { return new Ruleset().isToughnessTestRequired(this.actor); }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {Actor} args.actor
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor"]);

    this.actor = args.actor;
    this.contextType = args.contextType ?? "actor-health";

    const thiz = this;

    this.vmNsMaxHp = this.createVmNumberSpinner({
      id: "vmNsMaxHp",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.health.maxHP",
      isEditable: false,
    });
    this.vmNsHp = this.createVmNumberSpinner({
      id: "vmNsHp",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.health.HP",
    });
    this.vmNsMaxExhaustion = this.createVmNumberSpinner({
      id: "vmNsMaxExhaustion",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.health.maxExhaustion",
      isEditable: false,
    });
    this.vmNsExhaustion = this.createVmNumberSpinner({
      id: "vmNsExhaustion",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.health.exhaustion",
      min: 0,
    });
    this.vmNsMagicStamina = this.createVmNumberSpinner({
      id: "vmNsMagicStamina",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.health.magicStamina",
      min: 0,
    });
    this.vmNsMaxMagicStamina = this.createVmNumberSpinner({
      id: "vmNsMaxMagicStamina",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.health.maxMagicStamina",
      isEditable: false,
    });
    this.vmNsMaxInjuries = this.createVmNumberSpinner({
      id: "vmNsMaxInjuries",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.health.maxInjuries",
      isEditable: false,
      min: 1,
    });

    // Prepare illnesses list view models. 
    const actorIllnesses = this.actor.getIllnesses();
    for (const illness of actorIllnesses) {
      const vm = new IllnessListItemViewModel({
        ...args,
        id: illness.id,
        parent: thiz,
        item: illness,
      });
      this.illnesses.push(vm);
    }
    this.vmIllnessList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmIllnessList",
      indexDataSource: new DocumentListItemOrderDataSource({
        propertyOwner: thiz.actor,
        listName: "illnesses",
      }),
      listItemViewModels: this.illnesses,
      listItemTemplate: TEMPLATES.ILLNESS_LIST_ITEM,
      vmBtnAddItem: thiz.createVmBtnAdd({
        id: "vmBtnAddIllness",
        target: thiz.actor,
        creationType: "illness",
        withDialog: true,
        localizableLabel: "ambersteel.character.health.illness.add.label",
        localizableType: "ambersteel.character.health.illness.singular",
        localizableDialogTitle: "ambersteel.character.health.illness.add.query",
      }),
    });
    
    // Prepare injuries list view models. 
    const actorInjuries = this.actor.getInjuries();
    for (const injury of actorInjuries) {
      const vm = new InjuryListItemViewModel({
        ...args,
        id: injury.id,
        parent: thiz,
        item: injury,
      });
      this.injuries.push(vm);
    }
    this.vmInjuryList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmInjuryList",
      indexDataSource: new DocumentListItemOrderDataSource({
        propertyOwner: thiz.actor,
        listName: "injuries",
      }),
      listItemViewModels: this.injuries,
      listItemTemplate: TEMPLATES.INJURY_LIST_ITEM,
      vmBtnAddItem: thiz.createVmBtnAdd({
        id: "vmBtnAddInjury",
        target: thiz.actor,
        creationType: "injury",
        withDialog: true,
        localizableLabel: "ambersteel.character.health.injury.add.label",
        localizableType: "ambersteel.character.health.injury.singular",
        localizableDialogTitle: "ambersteel.character.health.injury.add.query",
      }),
    });
    
    // Prepare mutations list view models. 
    const actorMutations = this.actor.getMutations();
    for (const mutation of actorMutations) {
      const vm = new MutationListItemViewModel({
        ...args,
        id: mutation.id,
        parent: thiz,
        item: mutation,
      });
      this.mutations.push(vm);
    }
    this.vmMutationList = new SortableListViewModel({
      parent: thiz,
      isEditable: args.isEditable ?? thiz.isEditable,
      id: "vmMutationList",
      indexDataSource: new DocumentListItemOrderDataSource({
        propertyOwner: thiz.actor,
        listName: "mutations",
      }),
      listItemViewModels: this.mutations,
      listItemTemplate: TEMPLATES.MUTATION_LIST_ITEM,
      vmBtnAddItem: thiz.createVmBtnAdd({
        id: "vmBtnAddMutation",
        target: thiz.actor,
        creationType: "mutation",
        withDialog: true,
        localizableLabel: "ambersteel.character.health.mutation.add.label",
        localizableType: "ambersteel.character.health.mutation.singular",
        localizableDialogTitle: "ambersteel.character.health.mutation.add.query",
      }),
    });
  }
}
