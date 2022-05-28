import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SkillTableViewModel from "../components/component-skill-table-viewmodel.mjs";

export default class ActorSkillsViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_SKILLS; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /** @override */
  get entityId() { return this.actor.id; }
  
  get learningSkills() { return this.actor.data.data.learningSkills; }
  get skills() { return this.actor.data.data.skills; }
  
  /**
   * @type {SkillTableViewModel}
   */
  learningSkillsViewModel = undefined;
  /**
   * @type {String}
   * @readonly
   */
  get learningSkillsViewModelId() { return "child-learning-skills-viewmodel"; }
  
  /**
   * @type {SkillTableViewModel}
   */
  skillsViewModel = undefined;
  /**
   * @type {String}
   * @readonly
   */
  get skillsViewModelId() { return "child-skills-viewmodel"; }

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

    // Own properties.
    this.actor = args.actor;

    // Child view models. 
    const thiz = this;

    this.learningSkillsViewModel = new SkillTableViewModel({ ...args, id: this.learningSkillsViewModelId, parent: thiz, isLearningSkillsTable: true });
    this.skillsViewModel = new SkillTableViewModel({ ...args, id: this.skillsViewModelId, parent: thiz, isLearningSkillsTable: false });
  }
}
