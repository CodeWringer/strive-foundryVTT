import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import FateCardItemSheetViewModel from "../../../templates/item/fate-card/fate-card-item-sheet-viewmodel.mjs";
import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";

export default class AmbersteelFateItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.FATE_CARD_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.beliefSystem.fateSystem.fateCard.label"); }

  getViewModel(context, item) {
    return new FateCardItemSheetViewModel({
      id: item.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: item,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("fate-card", new AmbersteelFateItemSheet());
