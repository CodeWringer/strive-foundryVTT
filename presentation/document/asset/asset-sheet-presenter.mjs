import TransientAsset from "../../../business/document/item/transient-asset.mjs";
import ButtonTakeItemViewModel from "../../component/button-take-item/button-take-item-viewmodel.mjs";
import Component from "../../layout/component.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import AssetBasePresenter from "./asset-base-presenter.mjs";

/**
 * Presents a `TransientAsset` document in the form of a 
 * dedicated sheet. 
 * 
 * @property {TransientAsset} document The represented 
 * document instance. 
 * 
 * @extends AssetBasePresenter
 */
export default class AssetSheetPresenter extends AssetBasePresenter {
  buttonTake = new Component({
    template: ButtonTakeItemViewModel.TEMPLATE,
    viewModelFunc: (parent, isEditable, isGM) => {
      return new ButtonTakeItemViewModel({
        id: "take",
        parent: parent,
        target: this.document,
        contextType: TAKE_ITEM_CONTEXT_TYPES.itemSheet,
      });
    },
  });

  /** @override */
  getLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.document.img,
            this.document.name,
            this.buttonSendToChat,
            this.buttonTake,
          ],
        }),
        this.document.description,
        new RowLayout({
          content: [
            this.document.quantity,
            this.document.maxQuantity,
            this.document.bulk,
          ],
        }),
        this.document.tags,
      ],
    });
  }
}
