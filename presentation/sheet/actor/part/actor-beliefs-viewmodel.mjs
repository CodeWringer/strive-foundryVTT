import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class ActorBeliefsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_BELIEFS; }

  /** @override */
  get entityId() { return this.document.id; }

  get beliefs() {
    const dataBeliefs = this.document.beliefSystem.beliefs;
    return [dataBeliefs._0, dataBeliefs._1, dataBeliefs._2];
  }
  get instincts() {
    const dataInstincts = this.document.beliefSystem.instincts;
    return [dataInstincts._0, dataInstincts._1, dataInstincts._2];
  }

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
   * 
   * @param {TransientPc} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextType = args.contextType ?? "actor-beliefs";

    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmTfAmbition = factory.createVmTextField({
      parent: thiz,
      id: "vmTfAmbition",
      propertyOwner: thiz.document,
      propertyPath: "beliefSystem.ambition",
      placeholder: "ambersteel.character.beliefSystem.ambition",
    });

    for (let i = 0; i < this.beliefs.length; i++) {
      this.beliefViewModels.push(factory.createVmTextField({
        parent: thiz,
        id: `vmBelief-${i}`,
        propertyOwner: thiz.document,
        propertyPath: `beliefSystem.beliefs._${i}`,
        placeholder: "ambersteel.character.beliefSystem.belief.singular",
      }));
    }

    for (let i = 0; i < this.instincts.length; i++) {
      this.instinctViewModels.push(factory.createVmTextField({
        parent: thiz,
        id: `vmInstinct-${i}`,
        propertyOwner: thiz.document,
        propertyPath: `beliefSystem.instincts._${i}`,
        placeholder: "ambersteel.character.beliefSystem.instinct.singular",
      }));
    }
  }
}
