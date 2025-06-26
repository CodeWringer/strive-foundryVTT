import ViewModel from "../../../../view-model/view-model.mjs";
import AttributeTableViewModel from "./actor-attribute-table-viewmodel.mjs";
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import { ACTOR_TYPES } from "../../../../../business/document/actor/actor-types.mjs";
import { ExtenderUtil } from "../../../../../common/extender-util.mjs";
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs";

/**
 * @property {String} childTemplate
 * @property {ViewModel} vmChild
 */
export default class ActorAttributesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ATTRIBUTES; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isPC() { return this.document.type === ACTOR_TYPES.PC; }
  
  /**
   * @type {Boolean}
   * @readonly
   */
  get isNPC() { return this.document.type === ACTOR_TYPES.NPC; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;

    // Child view models. 
    this.childTemplate = AttributeTableViewModel.TEMPLATE;
    this.vmChild = new AttributeTableViewModel({
      id: "vmChild",
      parent: this,
      document: this.document,
      attributes: this.document.attributes,
      parent: this,
    });
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorAttributesViewModel));
  }

}
