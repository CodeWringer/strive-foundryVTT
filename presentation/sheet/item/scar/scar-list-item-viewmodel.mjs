import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import BaseListItemViewModel, { DataFieldComponent } from "../base/base-list-item-viewmodel.mjs";

/**
 * @property {TransientScar} document
 */
export default class ScarListItemViewModel extends BaseListItemViewModel {
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
        localizedIconToolTip: game.i18n.localize("ambersteel.character.health.injury.limit.label"),
        iconClass: "ico-limit-solid",
      }),
    ];
  }
}
