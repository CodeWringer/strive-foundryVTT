import GameSystemBaseItemSheet from "../game-system-base-item-sheet.mjs";
import HealthConditionItemSheetViewModel from "./health-condition-item-sheet-viewmodel.mjs";

export default class HealthConditionItemSheet extends GameSystemBaseItemSheet {
  /** @override */
  get template() { return HealthConditionItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.health.condition.condition"); }

  /** @override */
  _getViewModel(context, document, sheet) {
    return new HealthConditionItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}
