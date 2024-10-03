import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";
import InputRichTextViewModel from "../../../component/input-rich-text/input-rich-text-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

export default class ActorBiographyViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.ACTOR_BIOGRAPHY; }

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
    ValidationUtil.validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;
    
    const thiz = this;

    this.vmRtBiography = new InputRichTextViewModel({
      parent: thiz,
      id: "vmRtBiography",
      value: thiz.document.person.biography,
      onChange: (_, newValue) => {
        thiz.document.person.biography = newValue;
      },
    });
  }
}
