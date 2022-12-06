import SheetViewModel from "../module/components/sheet-viewmodel.mjs";
import { TEMPLATES } from "../module/templatePreloader.mjs";
import { validateOrThrow } from "../module/utils/validation-utility.mjs";

export default class GmNotesViewModel extends SheetViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.ACTOR_BIOGRAPHY; }

  /**
   * @type {Document}
   */
  document = undefined;

  /**
   * @type {Any | undefined}
   */
  owner = undefined;

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
   * @param {Document} args.document
   * @param {Any | undefined} args.owner
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    // Own properties.
    this.document = args.document;
    this.owner = args.owner;
  }
}
