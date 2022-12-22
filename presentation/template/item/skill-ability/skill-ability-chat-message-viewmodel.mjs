import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import { isNotBlankOrUndefined } from "../../../../business/util/validation-utility.mjs"
import ViewModel from "../../../view-model/view-model.mjs"
import { TEMPLATES } from "../../templatePreloader.mjs"

export default class SkillAbilityChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SKILL_ABILITY_CHAT_MESSAGE; }

  /**
   * @type {SkillAbility}
   */
  skillAbility = undefined;
  
  /** @override */
  get entityId() { return this.skillAbility.id; }

  /**
   * @type {String}
   */
  get owningDocumentId() { return this.skillAbility.owningDocument.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideObstacle() { return this.skillAbility.obstacle === undefined; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideOpposedBy() { return this.skillAbility.opposedBy === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideCondition() { return this.skillAbility.condition === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDistance() { return this.skillAbility.distance === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideAttackType() { return this.skillAbility.attackType === undefined; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDamage() { return this.skillAbility.damage.length <= 0; }

  /**
   * @type {String}
   * @readonly
   */
  get localizedAttackType() {
    if (this.skillAbility.attackType === undefined) return "";

    const localizableName = this.skillAbility.attackType.localizableName;
    return game.i18n.localize(localizableName);
  };

  get description() { return TextEditor.enrichHTML(this.skillAbility.description); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showParentSkillName() { return isNotBlankOrUndefined(this.parentSkillName); }

  /**
   * @type {String}
   * @readonly
   */
  get parentSkillName() { return this.skillAbility.getOwningDocument().name; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showParentSkillImage() { return isNotBlankOrUndefined(this.parentSkillImage); }
  
  /**
   * @type {String}
   * @readonly
   */
  get parentSkillImage() { return this.skillAbility.getOwningDocument().img; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showParentSkill() { return this.showParentSkillImage || this.showParentSkillName; }
  
  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM Optional. If true, the current user is a GM. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * 
   * @param {SkillAbility} args.skillAbility
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["skillAbility"]);

    this._isEditable = args.isEditable ?? false;
    this._isSendable = args.isSendable ?? false;
    this._isOwner = args.isOwner ?? false;
    this._isGM = args.isGM ?? false;
    this._contextTemplate = args.contextTemplate;

    this.skillAbility = args.skillAbility;
  }
}
