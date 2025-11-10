import ItemSheetSubType from "../item-sheet-subtype.mjs";
import HealthConditionItemSheetViewModel from "./health-condition-item-sheet-viewmodel.mjs";

export default class HealthConditionItemSheet extends ItemSheetSubType {
  /** @override */
  get template() { return HealthConditionItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.health.condition.condition"); }

  /** @override */
  createViewModel(context, document, sheet) {
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
