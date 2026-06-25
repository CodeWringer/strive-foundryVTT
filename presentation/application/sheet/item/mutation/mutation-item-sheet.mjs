import ItemSheetSubType from "../item-sheet-subtype.mjs";
import MutationItemSheetViewModel from "./mutation-item-sheet-viewmodel.mjs";

export default class MutationItemSheet extends ItemSheetSubType {
  /** @override */
  get template() { return MutationItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.health.mutation.singular"); }

  /** @override */
  createViewModel(context, document, sheet) {
    return new MutationItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}
