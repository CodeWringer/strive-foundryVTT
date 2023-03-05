import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class ActorDriversViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_DRIVERS; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @type {Array<String>}
   * @readonly
   */
  get aspirations() {
    const dataAspirations = this.document.driverSystem.aspirations;
    return [dataAspirations._0, dataAspirations._1, dataAspirations._2];
  }

  /**
   * @type {Array<String>}
   * @readonly
   */
  get reactions() {
    const dataReactions = this.document.driverSystem.reactions;
    return [dataReactions._0, dataReactions._1, dataReactions._2];
  }

  /**
   * @type {Array<ViewModel>}
   * @readonly
   */
  aspirationViewModels = [];

  /**
   * @type {Array<ViewModel>}
   * @readonly
   */
  reactionViewModels = [];

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
    this.contextType = args.contextType ?? "actor-drivers";

    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmTfAmbition = factory.createVmTextField({
      parent: thiz,
      id: "vmTfAmbition",
      propertyOwner: thiz.document,
      propertyPath: "driverSystem.ambition",
      placeholder: "ambersteel.character.driverSystem.ambition",
    });

    for (let i = 0; i < this.aspirations.length; i++) {
      this.aspirationViewModels.push(factory.createVmTextField({
        parent: thiz,
        id: `vmAspiration-${i}`,
        propertyOwner: thiz.document,
        propertyPath: `driverSystem.aspirations._${i}`,
        placeholder: "ambersteel.character.driverSystem.aspiration.singular",
      }));
    }

    for (let i = 0; i < this.reactions.length; i++) {
      this.reactionViewModels.push(factory.createVmTextField({
        parent: thiz,
        id: `vmReaction-${i}`,
        propertyOwner: thiz.document,
        propertyPath: `driverSystem.reactions._${i}`,
        placeholder: "ambersteel.character.driverSystem.reaction.singular",
      }));
    }
  }
}