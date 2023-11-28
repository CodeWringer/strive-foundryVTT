import { SKILL_TAGS } from "../../../../../business/tags/system-tags.mjs"
import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs"
import ButtonAddViewModel from "../../../../component/button-add/button-add-viewmodel.mjs"
import DocumentListItemOrderDataSource from "../../../../component/sortable-list/document-list-item-order-datasource.mjs"
import SortableListViewModel from "../../../../component/sortable-list/sortable-list-viewmodel.mjs"
import { TEMPLATES } from "../../../../templatePreloader.mjs"
import ViewModel from "../../../../view-model/view-model.mjs"
import SkillListItemViewModel from "../../../item/skill/skill-list-item-viewmodel.mjs"

export default class ActorSkillsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_SKILLS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * Returns `true`, if innate skills are to be hidden. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hideInnateSkills() { return this.innateSkillViewModels.length === 0; }

  /**
   * Returns `true`, if learning skills are to be hidden. 
   * 
   * @type {Boolean}
   * @readonly
   */
  get hideLearningSkills() { return this.document.progressionVisible === false; }

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

    this.innateSkillViewModels = [];
    this.innateSkillViewModels = this._getInnateSkillViewModels();
    if (this.hideInnateSkills === false) {
      this.vmInnateSkillList = new SortableListViewModel({
        id: "vmInnateSkillList",
        parent: thiz,
        isEditable: thiz.isEditable,
        isSendable: thiz.isSendable,
        contextTemplate: thiz.contextTemplate,
        indexDataSource: new DocumentListItemOrderDataSource({
          document: thiz.document,
          listName: "innateSkills",
        }),
        listItemViewModels: this.innateSkillViewModels,
        listItemTemplate: TEMPLATES.SKILL_LIST_ITEM,
      });
    }

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
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddLearningSkill",
        parent: this,
        isEditable: thiz.isEditable,
        target: thiz.document,
        creationType: "skill",
        withDialog: true,
        localizedLabel: game.i18n.localize("ambersteel.character.skill.learning.add.label"),
        creationData: {
          level: 0
        },
        localizedType: game.i18n.localize("ambersteel.character.skill.learning.singular"),
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
      vmBtnAddItem: new ButtonAddViewModel({
        id: "vmBtnAddKnownSkill",
        parent: this,
        target: thiz.document,
        isEditable: thiz.isEditable,
        creationType: "skill",
        withDialog: true,
        localizedLabel: game.i18n.localize("ambersteel.character.skill.known.add.label"),
        creationData: {
          level: 1
        },
        localizedType: game.i18n.localize("ambersteel.character.skill.known.singular"),
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
    // Innate skills
    const newInnateSkills = this._getInnateSkillViewModels();
    this._cullObsolete(this.innateSkillViewModels, newInnateSkills);
    this.innateSkillViewModels = newInnateSkills;
    
    // Known skills
    const newKnownSkills = this._getKnownSkillViewModels();
    this._cullObsolete(this.knownSkillViewModels, newKnownSkills);
    this.knownSkillViewModels = newKnownSkills;
    
    // Learning skills
    const newLearningSkills = this._getLearningSkillViewModels();
    this._cullObsolete(this.learningSkillViewModels, newLearningSkills);
    this.learningSkillViewModels = newLearningSkills;

    super.update(args);
  }

  /** @override */
  _getChildUpdates() {
    const updates = super._getChildUpdates();

    updates.set(this.vmKnownSkillList, {
      ...updates.get(this.vmKnownSkillList),
      listItemViewModels: this.knownSkillViewModels,
    });
    updates.set(this.vmLearningSkillList, {
      ...updates.get(this.vmLearningSkillList),
      listItemViewModels: this.learningSkillViewModels,
    });
    
    return updates;
  }
  
  /**
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getInnateSkillViewModels() {
    return this._getViewModels(
      this.document.skills.innate, 
      this.innateSkillViewModels,
      (args) => { return new SkillListItemViewModel(args); }
    );
  }
  
  
  /**
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getLearningSkillViewModels() {
    return this._getViewModels(
      this.document.skills.learning, 
      this.learningSkillViewModels,
      (args) => { return new SkillListItemViewModel(args); }
    );
  }
  
  /**
   * @returns {Array<SkillListItemViewModel>}
   * 
   * @private
   */
  _getKnownSkillViewModels() {
    return this._getViewModels(
      this.document.skills.known, 
      this.knownSkillViewModels,
      (args) => { return new SkillListItemViewModel(args); }
    );
  }
}
