import GameSystemBaseItemSheet from "../game-system-base-item-sheet.mjs";
import FateCardItemSheetViewModel from "./fate-card-item-sheet-viewmodel.mjs";

export default class FateItemSheet extends GameSystemBaseItemSheet {
  /** @override */
  get template() { return FateCardItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.driverSystem.fateSystem.fateCard.label"); }

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
