import ItemSheetSubType from "../item-sheet-subtype.mjs";
import MomentumActionItemSheetViewModel from "./momentum-action-item-sheet-viewmodel.mjs";

export default class MomentumActionItemSheet extends ItemSheetSubType {
  /** @override */
  get template() { return MomentumActionItemSheetViewModel.TEMPLATE; }

  /** @override */
  get localizedType() { return game.i18n.localize("system.combat.momentum.action"); }

  /** @override */
  createViewModel(context, document, sheet) {
    return new MomentumActionItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}
