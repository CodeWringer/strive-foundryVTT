import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import DocumentListItemOrderDataSource from "../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModelFactory from "../../../view-model/view-model-factory.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import SkillListItemViewModel from "../../item/skill/skill-list-item-viewmodel.mjs"

export default class ActorSkillsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_SKILLS; }

  /** @override */
  get entityId() { return this.document.id; }

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

    // Own properties.
    this.document = args.document;

    // Child view models. 
    const thiz = this;
    const factory = new ViewModelFactory();

    this.learningSkillViewModels = [];
    this.learningSkillViewModels = this._getLearningSkillViewModels();
    this.vmLearningSkillList = new SortableListViewModel({
      id: "vmLearningSkillList",
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      contextTemplate: thiz.contextTemplate,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "learningSkills",
      }),
      listItemViewModels: this.learningSkillViewModels,
      listItemTemplate: TEMPLATES.SKILL_LIST_ITEM,
      vmBtnAddItem: factory.createVmBtnAdd({
        id: "vmBtnAddLearningSkill",
        target: thiz.document,
        creationType: "skill",
        withDialog: true,
        localizableLabel: "ambersteel.character.skill.learning.add.label",
        creationData: {
          level: 0
        },
        localizableType: "ambersteel.character.skill.learning.singular",
        localizableDialogTitle: "ambersteel.character.skill.learning.add.query",
      }),
    });

    this.knownSkillViewModels = [];
    this.knownSkillViewModels = this._getKnownSkillViewModels();
    this.vmKnownSkillList = new SortableListViewModel({
      id: "vmKnownSkillList",
      parent: thiz,
      isEditable: thiz.isEditable,
      isSendable: thiz.isSendable,
      contextTemplate: thiz.contextTemplate,
      indexDataSource: new DocumentListItemOrderDataSource({
        document: thiz.document,
        listName: "knownSkills",
      }),
      listItemViewModels: this.knownSkillViewModels,
      listItemTemplate: TEMPLATES.SKILL_LIST_ITEM,
      vmBtnAddItem: factory.createVmBtnAdd({
        id: "vmBtnAddKnownSkill",
        target: thiz.document,
        creationType: "skill",
        withDialog: true,
        localizableLabel: "ambersteel.character.skill.known.add.label",
        creationData: {
          level: 1
        },
        localizableType: "ambersteel.character.skill.known.singular",
        localizableDialogTitle: "ambersteel.character.skill.known.add.query",
      }),
    });
  }

  /** @override */
  update(args = {}, childArgs = new Map()) {
    this.knownSkillViewModels = this._getKnownSkillViewModels();
    childArgs.set(this.vmKnownSkillList._id, {
      isEditable: this.isEditable || this.isGM,
      listItemViewModels: this.knownSkillViewModels,
    });

    this.learningSkillViewModels = this._getLearningSkillViewModels();
    childArgs.set(this.vmLearningSkillList._id, {
      isEditable: this.isEditable || this.isGM,
      listItemViewModels: this.learningSkillViewModels,
    });

    super.update(args, childArgs);
  }
  
  /**
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getLearningSkillViewModels() {
    const result = [];
    
    const documents = this.document.skills.learning;
    for (const document of documents) {
      let vm = this.learningSkillViewModels.find(it => it._id === document.id);
      if (vm === undefined) {
        vm = new SkillListItemViewModel({
          id: document.id,
          document: document,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
          isGM: this.isGM,
        });
      }
      result.push(vm);
    }

    return result;
  }
  
  /**
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getKnownSkillViewModels() {
    const result = [];
    
    const documents = this.document.skills.known;
    for (const document of documents) {
      let vm = this.knownSkillViewModels.find(it => it._id === document.id);
      if (vm === undefined) {
        vm = new SkillListItemViewModel({
          id: document.id,
          document: document,
          isEditable: this.isEditable,
          isSendable: this.isSendable,
          isOwner: this.isOwner,
          isGM: this.isGM,
        });
      }
      result.push(vm);
    }

    return result;
  }
}
