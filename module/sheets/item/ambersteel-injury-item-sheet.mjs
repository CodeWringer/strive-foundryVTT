import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import InjuryItemSheetViewModel from "../../../templates/item/injury/injury-item-sheet-viewmodel.mjs";

export default class AmbersteelInjuryItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return TEMPLATES.INJURY_ITEM_SHEET;
  }

  getViewModel(context) {
    return new InjuryItemSheetViewModel({
      id: this.getItem().id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: this.getItem(),
    });
  }
}