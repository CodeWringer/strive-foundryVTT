import TransientBaseCharacterActor from "../../../../../../business/model/document/actor/transient-base-character-actor.mjs";
import { ATTRIBUTES } from "../../../../../../business/ruleset/attribute/attributes.mjs";
import { ExtenderUtil } from "../../../../../../common/util/extender-util.mjs";
import { ValidationUtil } from "../../../../../../common/util/validation-utility.mjs";
import ViewModel from "../../../../../view-model/view-model.mjs";
import ActorAttributeViewModel from "./actor-attribute-viewmodel.mjs";

export default class ActorAttributesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_ATTRIBUTES; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {String}
   * @readonly
   */
  get attributeTemplate() { return ActorAttributeViewModel.TEMPLATE; }

  /**
   * @param {Object} args
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

    this.document = args.document;

    this.attributes = ATTRIBUTES.asArray().map(it => new ActorAttributeViewModel({
      id: it.name,
      document: this.document,
      attribute: it,
      parent: this,
    }));
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorAttributesViewModel));
  }

}
