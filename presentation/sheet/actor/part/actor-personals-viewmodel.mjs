import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

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

    this.vmTfSpecies = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfSpecies",
      value: thiz.document.person.species,
      onChange: (_, newValue) => {
        thiz.document.person.species = newValue;
      },
      placeholder: "ambersteel.character.personals.species",
    });
    this.vmTfCulture = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfCulture",
      value: thiz.document.person.culture,
      onChange: (_, newValue) => {
        thiz.document.person.culture = newValue;
      },
      placeholder: "ambersteel.character.personals.culture",
    });
    this.vmTfSex = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfSex",
      value: thiz.document.person.sex,
      onChange: (_, newValue) => {
        thiz.document.person.sex = newValue;
      },
      placeholder: "ambersteel.character.personals.sex",
    });
    this.vmTfAge = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmTfAge",
      value: thiz.document.person.age,
      onChange: (_, newValue) => {
        thiz.document.person.age = newValue;
      },
      placeholder: "ambersteel.character.personals.age",
    });
  }
}
