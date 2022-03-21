import SkillAbilityTableViewModel from "../../item/skill-ability/skill-ability-table-viewmodel.mjs";
import { TEMPLATES } from "../../../module/templatePreloader.mjs";
import { createUUID } from "../../../module/utils/uuid-utility.mjs";
import { validateOrThrow } from "../../../module/utils/validation-utility.mjs";
import SheetViewModel from "../../../module/components/sheet-viewmodel.mjs";

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
   * @type {Array<Object>}
   */
  skillsViewModels = [];
  
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

    this.actor = args.actor;
    this.isLearningSkillsTable = args.isLearningSkillsTable;
    this.contextType = args.contextType ?? "component-skill-table";

    const thiz = this;

    this.vmBtnAddSkill = this.createVmBtnAdd({
      id: "vmBtnAddSkill",
      creationType: "skill",
      target: this.actor,
      withDialog: true,
      creationData: `[value:${this.isLearningSkillsTable ? "0" : "1"}]`,
    });

    for (let i = 0; i < this.skills.length; i++) {
      const skill = this.skills[i];

      thiz.skillsViewModels.push({
        skill: skill,
        requiredSuccessses: skill.data.data.requiredSuccessses,
        requiredFailures: skill.data.data.requiredFailures,
        vmBtnRoll: thiz.createVmBtnRoll({
          id: `vmBtnRoll-skill-${i}`,
          target: skill,
          propertyPath: "data.data.totalValue" ,
          chatTitle: game.i18n.localize(skill.name),
          rollType: "dice-pool",
          callback: "advanceSkillBasedOnRollResult",
          callbackData: skill.id,
          actor: thiz.actor,
        }),
        vmBtnSendToChat: thiz.createVmBtnSendToChat({
          id: `vmBtnSendToChat-skill-${i}`,
          target: skill,
          chatTitle: game.i18n.localize(thiz.actor.data.name),
        }),
        vmBtnOpenSheet: thiz.createVmBtnOpenSheet({
          id: `vmBtnOpenSheet-skill-${i}`,
          target: skill.name,
        }),
        vmTfName: thiz.createVmTextField({
          id: `vmTfName-skill-${i}`,
          propertyOwner: skill,
          propertyPath: "name",
          placeholder: "ambersteel.labels.name",
        }),
        vmDdRelatedAttribute: thiz.createVmDropDown({
          id: `vmDdRelatedAttribute-skill-${i}`,
          propertyOwner: skill,
          propertyPath: "data.data.relatedAttribute",
          options: thiz.attributeOptions,
        }),
        vmNsLevel: thiz.createVmNumberSpinner({
          id: `vmNsLevel-skill-${i}`,
          propertyOwner: skill,
          propertyPath: "data.data.value",
          min: 0,
        }),
        vmNsSuccesses: thiz.createVmNumberSpinner({
          id: `vmNsSuccesses-skill-${i}`,
          propertyOwner: skill,
          propertyPath: "data.data.successes",
          min: 0,
        }),
        vmNsFailures: thiz.createVmNumberSpinner({
          id: `vmNsFailures-skill-${i}`,
          propertyOwner: skill,
          propertyPath: "data.data.failures",
          min: 0,
        }),
        vmBtnDelete: thiz.createVmBtnDelete({
          id: `vmBtnDelete-skill-${i}`,
          target: skill,
          withDialog: true,
        }),
        vmSkillAbilityTable: new SkillAbilityTableViewModel({
          id: `vmSkillAbilityTable-skill-${i}`,
          parent: thiz,
          isEditable: thiz.isEditable,
          isSendable: thiz.isSendable,
          isOwner: thiz.isOwner,
          isGM: thiz.isGM,
          item: skill,
          oneColumn: false,
          visGroupId: createUUID(),
          actor: thiz.actor,
        }),
      });
    }
  }
}
