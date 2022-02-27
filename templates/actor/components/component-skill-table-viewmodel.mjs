import SkillAbilityTableViewModel from "../../item/skill-ability/skill-ability-table-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import SheetViewModel from "../../sheet-viewmodel.mjs";
import { createUUID } from "../../../module/utils/uuid-utility.mjs";

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
   * @param {Boolean} isEditable If true, the sheet is editable. 
   * @param {Boolean} isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean} isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean} isGM If true, the current user is a GM. 
   * 
   * @param {Actor} actor
   * @param {Boolean} isLearningSkillsTable
   */
  constructor(args = {}) {
    super(args);

    // Own properties.
    this.actor = args.actor;
    this.isLearningSkillsTable = args.isLearningSkillsTable;

    // Child view models. 
    const thiz = this;

    for (const skill of this.skills) {
      const vm = new SkillAbilityTableViewModel({
        ...args,
        id: "skill-abilities",
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
