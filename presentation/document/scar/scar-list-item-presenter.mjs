import TransientScar from "../../../business/document/item/transient-scar.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientScar` document in the form of a 
 * embedded list item. 
 * 
 * @property {TransientScar} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class ScarListItemPresenter extends DocumentPresenter {
  /**
   * @param {Object} args 
   * @param {TransientScar} args.document 
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
            this.buttonSendToChat,
            this.document.img,
            this.document.name,
            this.buttonDelete,
          ],
        }),
        this.document.description,
        this.document.limit,
      ],
    });
  }
}
