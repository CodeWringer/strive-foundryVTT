import { TEMPLATES } from "../../../templatePreloader.mjs";
import { ITEM_SHEET_SUBTYPE } from "../item-sheet-subtype.mjs";
import AmbersteelBaseItemSheet from "../ambersteel-base-item-sheet.mjs";
import AssetItemSheetViewModel from "./asset-item-sheet-viewmodel.mjs";

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
    let viewModel = game.ambersteel.viewModels.get(document.id);
    if (viewModel === undefined) {
      viewModel = new AssetItemSheetViewModel({
        id: document.id,
        document: document.getTransientObject(),
        isEditable: context.isEditable,
        isSendable: context.isSendable,
        isOwner: context.isOwner,
      });
      game.ambersteel.viewModels.set(document.id, viewModel);
    } else {
      viewModel.update({
        isEditable: context.isEditable,
        isSendable: context.isSendable,
        isOwner: context.isOwner,
      });
    }
    return viewModel;
  }
}

ITEM_SHEET_SUBTYPE.set("item", new AmbersteelAssetItemSheet());
