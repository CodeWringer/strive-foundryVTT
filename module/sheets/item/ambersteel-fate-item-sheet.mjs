import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import FateCardItemSheetViewModel from "../../../templates/item/fate-card/fate-card-item-sheet-viewmodel.mjs";

export default class AmbersteelFateItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return TEMPLATES.FATE_CARD_ITEM_SHEET;
  }

  getViewModel(context) {
    return new FateCardItemSheetViewModel({
      id: this.getItem().id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: this.getItem(),
    });
  }
}