import { isNotBlankOrUndefined } from "../../../../business/util/validation-utility.mjs"
import { isDefined } from "../../../../business/util/validation-utility.mjs"
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs"
import LazyRichTextViewModel from "../../../component/lazy-rich-text/lazy-rich-text-viewmodel.mjs"
import { TEMPLATES } from "../../../templatePreloader.mjs"
import ViewModel from "../../../view-model/view-model.mjs"

export default class ExpertiseChatMessageViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.EXPERTISE_CHAT_MESSAGE; }

  /**
   * @type {Expertise}
   */
  expertise = undefined;
  
  /** @override */
  get entityId() { return this.expertise.id; }

  /**
   * @type {String}
   */
  get owningDocumentId() { return this.expertise.owningDocument.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideObstacle() { return isDefined(this.expertise.obstacle) !== true; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get hideOpposedBy() { return isDefined(this.expertise.opposedBy) !== true; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideCondition() { return isDefined(this.expertise.condition) !== true; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDistance() { return isDefined(this.expertise.distance) !== true; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideAttackType() { return isDefined(this.expertise.attackType) !== true; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get hideDamage() { return this.expertise.damage.length <= 0; }

  /**
   * @type {String}
   * @readonly
   */
  get localizedAttackType() {
    if (isDefined(this.expertise.attackType) !== true) return "";

    const localizableName = this.expertise.attackType.localizableName;
    return game.i18n.localize(localizableName);
  };

  /**
   * @type {Boolean}
   * @readonly
   */
  get showParentSkillName() { return isNotBlankOrUndefined(this.parentSkillName); }

  /**
   * @type {String}
   * @readonly
   */
  get parentSkillName() { return this.expertise.owningDocument.name; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showParentSkillImage() { return isNotBlankOrUndefined(this.parentSkillImage); }
  
  /**
   * @type {String}
   * @readonly
   */
  get parentSkillImage() { return this.expertise.owningDocument.img; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get showParentSkill() { return this._showParentSkill === true && (this.showParentSkillImage === true || this.showParentSkillName === true); }
  
  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Expertise} args.expertise 
   * @param {Boolean | undefined} args.isEditable Optional. If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable Optional. If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner Optional. If true, the current user is the owner of the represented document. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * @param {Boolean | undefined} args.showParentSkill Optional. If true, will show the parent skill name and icon, if possible. 
   * * Default `true`
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["expertise"]);

    this._isEditable = args.isEditable ?? false;
    this._isSendable = args.isSendable ?? false;
    this._isOwner = args.isOwner ?? false;
    this._contextTemplate = args.contextTemplate;
    this._showParentSkill = args.showParentSkill ?? true;

    this.expertise = args.expertise;

    this.vmLazyDescription = new LazyRichTextViewModel({
      id: "vmLazyDescription",
      parent: this,
      isEditable: this.isEditable,
      isSendable: this.isSendable,
      isOwner: this.isOwner,
      renderableContent: this.expertise.description,
    });
  }
}
