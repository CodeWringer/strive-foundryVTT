import GameSystemBaseItemSheet from "../game-system-base-item-sheet.mjs";
import InjuryItemSheetViewModel from "./injury-item-sheet-viewmodel.mjs";

export default class InjuryItemSheet extends GameSystemBaseItemSheet {
  /** @override */
  get template() { return InjuryItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.health.injury.singular"); }

  /** @override */
  _getViewModel(context, document, sheet) {
    return new InjuryItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}
