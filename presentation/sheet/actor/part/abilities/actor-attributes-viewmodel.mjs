import { validateOrThrow } from "../../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../../templatePreloader.mjs";
import ViewModel from "../../../../view-model/view-model.mjs";
import ChallengeRatingViewModel from "./challenge-rating-viewmodel.mjs";
import AttributeTableViewModel from "./actor-attribute-table-viewmodel.mjs";
import TransientBaseCharacterActor from "../../../../../business/document/actor/transient-base-character-actor.mjs";
import { ACTOR_TYPES } from "../../../../../business/document/actor/actor-types.mjs";

/**
 * @property {String} childTemplate
 * @property {ViewModel} vmChild
 */
export default class ActorAttributesViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_ATTRIBUTES; }

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
    validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;

    // Child view models. 
    const isExpanded = (this.isPC === true || (this.isNPC === true && this.document.isChallengeRatingEnabled === false));
    if (isExpanded === true) {
      this.childTemplate = AttributeTableViewModel.TEMPLATE;
      this.vmChild = new AttributeTableViewModel({
        id: "vmChild",
        parent: this,
        document: this.document,
        attributes: this.document.attributes,
        parent: this,
        headerInteractible: this.isNPC === true,
        onHeaderClicked: () => {
          if (this.isNPC === true) {
            this.document.isChallengeRatingEnabled = true;
          }
        },
      });
    } else {
      this.childTemplate = ChallengeRatingViewModel.TEMPLATE;
      this.vmChild = new ChallengeRatingViewModel({
        id: "vmChild",
        parent: this,
        challengeRating: this.document.challengeRating,
        localizedLabel: game.i18n.localize("system.character.advancement.challengeRating.label"),
        actor: this.document,
        onClicked: () => {
          if (this.isNPC === true) {
            this.document.isChallengeRatingEnabled = false;
          }
        },
        onChallengeRatingChanged: (_, newValue) => {
          this.document.challengeRating = newValue;
        },
      });
    }
  }
}
