import SkillAbilityTableViewModel from "../../item/skill-ability/skill-ability-table-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";
import { createUUID } from "../../../module/utils/uuid-utility.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";

export default class SkillTableViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_SKILL_TABLE; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /**
   * @type {Boolean}
   */
  isLearningSkillsTable = false;

  /**
   * @type {Array<Item>}
   */
  get skills() {
    if (this.isLearningSkillsTable) {
      return this.actor.data.data.learningSkills;
    } else {
      return this.actor.data.data.skills;
    }
  }

  /**
   * @type {Array<ChoiceOption>}
   */
  get attributeOptions() { return game.ambersteel.getAttributeOptions(); }

  /**
   * @type {Map<String, SkillAbilityTableViewModel>}
   */
  skillAbilityTableViewModels = Object.create(null);
  
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
   * @param {Boolean} args.isLearningSkillsTable
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["actor", "isLearningSkillsTable"]);

    // Own properties.
    this.actor = args.actor;
    this.isLearningSkillsTable = args.isLearningSkillsTable;

    // Child view models. 
    const thiz = this;

    for (const skill of this.skills) {
      const vm = new SkillAbilityTableViewModel({
        ...args,
        id: `${skill.id}-skill-abilities`,
        parent: thiz,
        item: skill,
        _oneColumn: false,
        _visGroupId: createUUID(),
        actor: thiz.actor,
      });
      this.skillAbilityTableViewModels[skill.id] = vm;
    }
  }
}
