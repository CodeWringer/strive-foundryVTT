import ViewModel from "../../../../view-model/view-model.mjs"
import ActorDriversViewModel from "./actor-drivers-viewmodel.mjs"
import ActorFateViewModel from "../actor-fate-viewmodel.mjs"
import PersonalityTraitsViewModel from "./personality-traits/personality-traits-viewmodel.mjs"
import { ACTOR_TYPES } from "../../../../../business/document/actor/actor-types.mjs"
import { ExtenderUtil } from "../../../../../common/extender-util.mjs"
import { ValidationUtil } from "../../../../../business/util/validation-utility.mjs"

export default class ActorPersonalityViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_PERSONALITY; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {String}
   * @readonly
   */
  get personalityTraitsTemplate() { return game.strive.const.TEMPLATES.ACTOR_PERSONALITY_TRAITS; }

  /**
   * @type {String}
   * @readonly
   */
  get driversTemplate() { return game.strive.const.TEMPLATES.ACTOR_DRIVERS; }

  /**
   * @type {String}
   * @readonly
   */
  get fateTemplate() { return game.strive.const.TEMPLATES.ACTOR_FATE; }

  /**
   * Returns true, if the actor is a player character. 
   * 
   * @type {Boolean}
   */
  get isPC() { return this.document.type === ACTOR_TYPES.PC; }
  
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
    const thiz = this;

    this.personalityTraitsViewModel = new PersonalityTraitsViewModel({
      ...args,
      id: "personalityTraits",
      parent: thiz,
      isSendable: this.isSendable,
      isEditable: this.isEditable,
      isOwner: this.isOwner,
      document: this.document,
    });
    if (this.isPC) {
      this.driversViewModel = new ActorDriversViewModel({
        ...args,
        id: "drivers",
        parent: thiz,
        isSendable: this.isSendable,
        isEditable: this.isEditable,
        isOwner: this.isOwner,
      });
      this.fateViewModel = new ActorFateViewModel({
        ...args,
        id: "fate",
        parent: thiz,
        isSendable: this.isSendable,
        isEditable: this.isEditable,
        isOwner: this.isOwner,
      });
    }
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ActorPersonalityViewModel));
  }

}
