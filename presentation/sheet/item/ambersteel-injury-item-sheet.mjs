import InjuryItemSheetViewModel from "../../template/item/injury/injury-item-sheet-viewmodel.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";

export default class AmbersteelInjuryItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.INJURY_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.health.injury.singular"); }

  getViewModel(context, item) {
    return new InjuryItemSheetViewModel({
      id: item.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: item,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("injury", new AmbersteelInjuryItemSheet());
