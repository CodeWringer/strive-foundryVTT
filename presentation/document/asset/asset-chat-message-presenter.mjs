import TransientAsset from "../../../business/document/item/transient-asset.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import AssetBasePresenter from "./asset-base-presenter.mjs";

/**
 * Presents a `TransientAsset` document in the form of a 
 * chat message. 
 * 
 * @property {TransientAsset} document The represented 
 * document instance. 
 * 
 * @extends AssetBasePresenter
 */
export default class AssetChatMessagePresenter extends AssetBasePresenter {
  /** @override */
  getLayout() {
    return new ColumnLayout({
      content: [
        new RowLayout({
          cssClass: "header",
          content: [
            this.document.img,
            this.document.name,
            this.document.state,
          ],
        }),
        this.document.description,
        this.document.quantity,
        this.document.maxQuantity,
        this.document.bulk,
      ],
    });
  }
}
