import GameSystemBaseItemSheet from "../game-system-base-item-sheet.mjs";
import IllnessItemSheetViewModel from "./illness-item-sheet-viewmodel.mjs";

export default class IllnessItemSheet extends GameSystemBaseItemSheet {
  /** @override */
  get template() { return IllnessItemSheetViewModel.TEMPLATE; }

  /** @override */
  get title() { return game.i18n.localize("system.character.health.illness.singular"); }

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
