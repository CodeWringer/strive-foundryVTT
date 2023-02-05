import { TEMPLATES } from "../../../templatePreloader.mjs";
import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import ScarItemSheetViewModel from "./scar-item-sheet-viewmodel.mjs";

export default class AmbersteelScarItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.SCAR_ITEM_SHEET; }

  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.health.scar.singular"); }

  /** @override */
  _getViewModel(context, document, sheet) {
    return new ScarItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("scar", new AmbersteelScarItemSheet());
