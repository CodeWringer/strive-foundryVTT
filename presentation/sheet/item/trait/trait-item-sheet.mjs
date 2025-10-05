import ItemSheetSubType from "../item-sheet-subtype.mjs";
import TraitItemSheetViewModel from "./trait-item-sheet-viewmodel.mjs";

export default class TraitItemSheet extends ItemSheetSubType {
  /** @override */
  get template() { return TraitItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.trait.trait"); }

  /** @override */
  createViewModel(context, document, sheet) {
    return new TraitItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}
