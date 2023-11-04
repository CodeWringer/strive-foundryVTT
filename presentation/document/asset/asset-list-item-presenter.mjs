import TransientAsset from "../../../business/document/item/transient-asset.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import AssetBasePresenter from "./asset-base-presenter.mjs";

/**
 * Presents a `TransientAsset` document in the form of a 
 * embedded list item. 
 * 
 * @property {TransientAsset} document The represented 
 * document instance. 
 * 
 * @extends AssetBasePresenter
 */
export default class AssetListItemPresenter extends AssetBasePresenter {
  /** @override */
  getLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.buttonSendToChat,
            this.document.img,
            this.document.name,
            this.document.state,
            this.buttonDelete,
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
