import TransientScar from "../../../../business/document/item/transient-scar.mjs";
import { validateOrThrow } from "../../../../business/util/validation-utility.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs";
import { TemplatedComponent } from "../base/templated-component.mjs";

export default class ScarListItemViewModel extends BaseListItemViewModel {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientScar} args.document 
   */
  constructor(args = {}) {
    super({
      ...args,
      dataFields: [
        new TemplatedComponent({
          template: InputTextFieldViewModel.TEMPLATE,
          viewModel: new InputTextFieldViewModel({
            parent: this,
            id: "vmLimit",
            value: this.document.limit,
            onChange: (_, newValue) => {
              this.document.limit = newValue;
            },
          }),
        }),
      ],
    });
    
    validateOrThrow(args, ["document"]);
  }
}
