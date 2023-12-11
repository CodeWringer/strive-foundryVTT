import InputTextFieldViewModel from "../../../component/input-textfield/input-textfield-viewmodel.mjs";
import BaseListItemViewModel from "../base/base-list-item-viewmodel.mjs";
import { TemplatedComponent } from "../base/templated-component.mjs";

/**
 * @property {TransientScar} document
 */
export default class ScarListItemViewModel extends BaseListItemViewModel {
  /** @override */
  getDataFields() {
    return [
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
    ];
  }
}
