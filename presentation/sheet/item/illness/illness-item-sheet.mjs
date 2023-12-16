import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import IllnessItemSheetViewModel from "./illness-item-sheet-viewmodel.mjs";

export default class IllnessItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return IllnessItemSheetViewModel.TEMPLATE; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.health.illness.singular"); }

  /** @override */
  _getViewModel(context, document, sheet) {
    return new IllnessItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("illness", new IllnessItemSheet());
