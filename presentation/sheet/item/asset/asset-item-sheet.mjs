import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import GameSystemBaseItemSheet from "../game-system-base-item-sheet.mjs";
import AssetItemSheetViewModel from "./asset-item-sheet-viewmodel.mjs";

/**
 * Represents an "asset" type item sheet. 
 */
export default class AssetItemSheet extends GameSystemBaseItemSheet {
  /** @override */
  get template() { return AssetItemSheetViewModel.TEMPLATE;  }
  
  /** @override */
  get title() { return game.i18n.localize("system.character.asset.singular"); }

  /** @override */
  _getViewModel(context, document, sheet) {
    return new AssetItemSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
}

ITEM_SHEET_SUBTYPE.set("item", new AssetItemSheet());
