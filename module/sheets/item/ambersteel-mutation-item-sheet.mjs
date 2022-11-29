import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import MutationItemSheetViewModel from "../../../templates/item/mutation/mutation-item-sheet-viewmodel.mjs";

export default class AmbersteelMutationItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return TEMPLATES.MUTATION_ITEM_SHEET;
  }

  getViewModel(context) {
    return new MutationItemSheetViewModel({
      id: this.getItem().id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: this.getItem(),
    });
  }
}