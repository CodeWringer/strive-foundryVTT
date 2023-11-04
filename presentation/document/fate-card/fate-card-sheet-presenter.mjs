import TransientFateCard from "../../../business/document/item/transient-fate-card.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientFateCard` document in the form of a 
 * dedicated sheet. 
 * 
 * @property {TransientFateCard} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class FateCardSheetPresenter extends DocumentPresenter {
  /**
   * @param {Object} args 
   * @param {TransientFateCard} args.document 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["document"]);

    this.document = args.document;
  }

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
          ],
        }),
        this.document.description,
        new RowLayout({
          content: [
            this.document.costMiFP,
            this.document.costMaFP,
            this.document.costAFP,
          ],
        }),
      ],
    });
  }
}
