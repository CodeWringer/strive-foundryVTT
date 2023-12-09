import TransientScar from "../../../../business/document/item/transient-scar.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs";

export default class ScarListItemViewModel extends BaseListItemViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.SCAR_LIST_ITEM; }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {TransientScar} args.document 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.contextTemplate = args.contextTemplate ?? "scar-list-item";
    const thiz = this;

    this.vmLimit = new InputTextFieldViewModel({
      parent: thiz,
      id: "vmLimit",
      value: thiz.document.limit,
      onChange: (_, newValue) => {
        thiz.document.limit = newValue;
      },
    });
  }
}
