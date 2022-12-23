import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import ViewModelFactory from "../../../view-model/view-model-factory.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";

export default class ActorPersonalsViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_PERSONALS; }

  /** @override */
  get entityId() { return this.document.id; }

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
   * @param {TransientBaseCharacterActor} args.document
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the mandatory arguments aren't defined. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextType = args.contextType ?? "actor-personals";

    const thiz = this;
    const factory = new ViewModelFactory();

    this.vmTfSpecies = factory.createVmTextField({
      parent: thiz,
      id: "vmTfSpecies",
      propertyOwner: thiz.document,
      propertyPath: "person.species",
      placeholder: "ambersteel.character.personals.species",
    });
    this.vmTfCulture = factory.createVmTextField({
      parent: thiz,
      id: "vmTfCulture",
      propertyOwner: thiz.document,
      propertyPath: "person.culture",
      placeholder: "ambersteel.character.personals.culture",
    });
    this.vmTfSex = factory.createVmTextField({
      parent: thiz,
      id: "vmTfSex",
      propertyOwner: thiz.document,
      propertyPath: "person.sex",
      placeholder: "ambersteel.character.personals.sex",
    });
    this.vmTfAge = factory.createVmTextField({
      parent: thiz,
      id: "vmTfAge",
      propertyOwner: thiz.document,
      propertyPath: "person.age",
      placeholder: "ambersteel.character.personals.age",
    });
  }
}
