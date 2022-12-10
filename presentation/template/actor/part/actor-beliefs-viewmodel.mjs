import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import SheetViewModel from "../../../view-model/sheet-view-model.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class ActorBeliefsViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_BELIEFS; }

  /**
   * @type {Actor}
   */
  actor = undefined;

  /** @override */
  get entityId() { return this.actor.id; }

  get beliefs() { return this.actor.data.data.beliefSystem.beliefs; }
  get instincts() { return this.actor.data.data.beliefSystem.instincts; }

  beliefViewModels = [];
  instinctViewModels = [];

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

    this.actor = args.actor;
    this.contextType = args.contextType ?? "actor-beliefs";

    const thiz = this;

    this.vmTfAmbition = this.createVmTextField({
      id: "vmTfAmbition",
      propertyOwner: thiz.actor,
      propertyPath: "data.data.beliefSystem.ambition",
      placeholder: "ambersteel.character.beliefSystem.ambition",
    });

    for (let i = 0; i < this.beliefs.length; i++) {
      this.beliefViewModels.push(this.createVmTextField({
        id: `vmBelief${i}`,
        propertyOwner: thiz.actor,
        propertyPath: `data.data.beliefSystem.beliefs[${i}]`,
        placeholder: "ambersteel.character.beliefSystem.belief.singular",
      }));
    }

    for (let i = 0; i < this.instincts.length; i++) {
      this.instinctViewModels.push(this.createVmTextField({
        id: `vmInstinct${i}`,
        propertyOwner: thiz.actor,
        propertyPath: `data.data.beliefSystem.instincts[${i}]`,
        placeholder: "ambersteel.character.beliefSystem.instinct.singular",
      }));
    }
  }
}
