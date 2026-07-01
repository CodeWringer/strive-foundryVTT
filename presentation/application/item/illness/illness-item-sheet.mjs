import ItemSheetSubType from "../item-sheet-subtype.mjs";
import IllnessItemSheetViewModel from "./illness-item-sheet-viewmodel.mjs";

export default class IllnessItemSheet extends ItemSheetSubType {
  /** @override */
  get template() { return IllnessItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.health.illness.singular"); }

  /** @override */
  createViewModel(context, document, sheet) {
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
