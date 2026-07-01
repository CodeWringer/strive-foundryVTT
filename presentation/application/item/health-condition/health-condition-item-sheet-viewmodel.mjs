import TransientHealthCondition from "../../../../business/model/document/item/transient-health-condition.mjs"
import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import InputNumberSpinnerViewModel from "../../../component/input-number-spinner/input-number-spinner-viewmodel.mjs"
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs"
import { DataFieldComponent } from "../../datafield-component.mjs"

/**
 * @property {TransientHealthCondition} document
 */
export default class HealthConditionItemSheetViewModel extends BaseItemSheetViewModel {
  
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
   * @param {TransientHealthCondition} args.document 
   */
  constructor(args = {}) {
    super(args);
  }

  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: InputNumberSpinnerViewModel.TEMPLATE,
        viewModel: new InputNumberSpinnerViewModel({
          id: "vmLimit",
          parent: this,
          value: this.document.limit,
          onChange: (_, newValue) => {
            this.document.limit = newValue;
          },
        }),
        localizedToolTip: game.i18n.localize("system.character.health.condition.limit"),
        iconClass: "ico-limit-solid",
      }),
    ];
  }

  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(HealthConditionItemSheetViewModel));
  }

}
