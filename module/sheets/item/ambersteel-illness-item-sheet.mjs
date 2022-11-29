import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import IllnessItemSheetViewModel from "../../../templates/item/illness/illness-item-sheet-viewmodel.mjs";

export default class AmbersteelIllnessItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return TEMPLATES.ILLNESS_ITEM_SHEET;
  }

  getViewModel(context) {
    return new IllnessItemSheetViewModel({
      id: this.getItem().id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: this.getItem(),
    });
  }
}