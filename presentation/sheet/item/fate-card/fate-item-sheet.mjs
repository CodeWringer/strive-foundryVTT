import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import FateCardItemSheetViewModel from "./fate-card-item-sheet-viewmodel.mjs";

export default class FateItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return FateCardItemSheetViewModel.TEMPLATE; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.driverSystem.fateSystem.fateCard.label"); }

  /** @override */
  _getViewModel(context, document, sheet) {
    return new FateCardItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("fate-card", new FateItemSheet());
