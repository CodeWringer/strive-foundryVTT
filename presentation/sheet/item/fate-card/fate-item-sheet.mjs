import ItemSheetSubType from "../item-sheet-subtype.mjs";
import FateCardItemSheetViewModel from "./fate-card-item-sheet-viewmodel.mjs";

export default class FateItemSheet extends ItemSheetSubType {
  /** @override */
  get template() { return FateCardItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.driverSystem.fateSystem.fateCard.label"); }

  /** @override */
  createViewModel(context, document, sheet) {
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
