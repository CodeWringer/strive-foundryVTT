import { TEMPLATES } from "../../template/templatePreloader.mjs";
import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";
import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import AssetItemSheetViewModel from "./asset/asset-item-sheet-viewmodel.mjs";

/**
 * Represents an "asset" type item sheet. 
 */
export default class AmbersteelAssetItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() { return TEMPLATES.ASSET_SHEET;  }
  
  /** @override */
  get title() { return game.i18n.localize("ambersteel.character.asset.singular"); }

  /**
   * Returns a view model for the given document. 
   * 
   * @param {Object} context 
   * @param {TransientDocument} document 
   * 
   * @returns {AssetItemSheetViewModel}
   * 
   * @override
   */
  getViewModel(context, document) {
    return new AssetItemSheetViewModel({
      id: document.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      document: document.getTransientObject(),
    });
  }
}

ITEM_SHEET_SUBTYPE.set("item", new AmbersteelBaseItemSheet());
