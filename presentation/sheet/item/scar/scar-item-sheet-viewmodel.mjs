import { ExtenderUtil } from "../../../../common/extender-util.mjs";
import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import BaseItemSheetViewModel from "../base/base-item-sheet-viewmodel.mjs";
import { DataFieldComponent } from "../base/datafield-component.mjs";

/**
 * @property {TransientScar} document
 */
export default class ScarItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  getDataFields() {
    return [
      new DataFieldComponent({
        template: InputTextFieldViewModel.TEMPLATE,
        viewModel: new InputTextFieldViewModel({
          parent: this,
          id: "vmLimit",
          value: this.document.limit,
          onChange: (_, newValue) => {
            this.document.limit = newValue;
          },
        }),
        localizedIconToolTip: game.i18n.localize("system.character.health.injury.limit.label"),
        iconClass: "ico-limit-solid",
      }),
    ];
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(ScarItemSheetViewModel));
  }

}
