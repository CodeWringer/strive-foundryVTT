import Ruleset from "../../../../business/ruleset/ruleset.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs";
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import IllnessListItemViewModel from "../../item/illness/illness-list-item-viewmodel.mjs";
import InjuryListItemViewModel from "../../item/injury/injury-list-item-viewmodel.mjs";
import MutationListItemViewModel from "../../item/mutation/mutation-list-item-viewmodel.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

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
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
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
      propertyPath: "health.maxMagicStamina",
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
    const illnesses = this.document.health.illnesses;
    for (const illness of illnesses) {
      const vm = new IllnessListItemViewModel({
        ...args,
        id: illness.id,
        parent: thiz,
        document: illness,
      });
      this.illnesses.push(vm);
    }
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
        parent: thiz,
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
    const injuries = this.document.health.injuries;
    for (const injury of injuries) {
      const vm = new InjuryListItemViewModel({
        ...args,
        id: injury.id,
        parent: thiz,
        document: injury,
      });
      this.injuries.push(vm);
    }
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
        parent: thiz,
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
    const mutations = this.document.health.mutations;
    for (const mutation of mutations) {
      const vm = new MutationListItemViewModel({
        ...args,
        id: mutation.id,
        parent: thiz,
        document: mutation,
      });
      this.mutations.push(vm);
    }
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
        parent: thiz,
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
}
