import GameSystemBaseItemSheet from "../game-system-base-item-sheet.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import ScarItemSheetViewModel from "./scar-item-sheet-viewmodel.mjs";

export default class ScarItemSheet extends GameSystemBaseItemSheet {
  /** @override */
  get template() { return ScarItemSheetViewModel.TEMPLATE; }

  /** @override */
  get title() { return game.i18n.localize("system.character.health.scar.singular"); }

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

ITEM_SHEET_SUBTYPE.set("scar", new ScarItemSheet());
