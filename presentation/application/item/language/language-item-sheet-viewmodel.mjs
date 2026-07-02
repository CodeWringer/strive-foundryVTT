import InputTextFieldViewModel from "../../component/input-textfield/input-textfield-viewmodel.mjs";
import { TEMPLATES } from "../../templates.mjs";
import BaseItemSheetViewModel from "../base/sheet/base-item-sheet-viewmodel.mjs";

export default class LanguageItemSheetViewModel extends BaseItemSheetViewModel {
  /** @override */
  static get TEMPLATE() { throw new Error("NotImplementedException"); }
  
  /** @override */
  get clazz() { return LanguageItemSheetViewModel; }

  /** @override */
  get contentTemplate() { return TEMPLATES.application.item.language; }

  constructor(args = {}) {
    super(args);

    this.vmName = new InputTextFieldViewModel({
      id: "vmName",
      parent: this,
      value: this.document.name, // TODO #761
      onChange: (_, newValue) => {
        // 
      },
    });
  }
}
