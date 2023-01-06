import { TEMPLATES } from "../../../templatePreloader.mjs";
import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import FateCardItemSheetViewModel from "./fate-card-item-sheet-viewmodel.mjs";

export default class AmbersteelFateItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.FATE_CARD_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.beliefSystem.fateSystem.fateCard.label"); }

  /** @override */
  getViewModel(context, document) {
    return new FateCardItemSheetViewModel({
      id: document.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      document: document.getTransientObject(),
    });
  }
}

ITEM_SHEET_SUBTYPE.set("fate-card", new AmbersteelFateItemSheet());
