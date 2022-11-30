import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import IllnessItemSheetViewModel from "../../../templates/item/illness/illness-item-sheet-viewmodel.mjs";
import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";

export default class AmbersteelIllnessItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.ILLNESS_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.health.illness.singular"); }

  getViewModel(context, item) {
    return new IllnessItemSheetViewModel({
      id: item.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: item,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("illness", new AmbersteelIllnessItemSheet());
