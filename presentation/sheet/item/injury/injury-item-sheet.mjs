import ItemSheetSubType from "../item-sheet-subtype.mjs";
import InjuryItemSheetViewModel from "./injury-item-sheet-viewmodel.mjs";

export default class InjuryItemSheet extends ItemSheetSubType {
  /** @override */
  get template() { return InjuryItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.character.health.injury.singular"); }

  /** @override */
  createViewModel(context, document, sheet) {
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
