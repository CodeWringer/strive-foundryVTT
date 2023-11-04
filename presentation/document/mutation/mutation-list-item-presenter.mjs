import TransientMutation from "../../../business/document/item/transient-mutation.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientMutation` document in the form of a 
 * embedded list item. 
 * 
 * @property {TransientMutation} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class MutationListItemPresenter extends DocumentPresenter {
  /**
   * @param {Object} args 
   * @param {TransientMutation} args.document 
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
      ],
    });
  }
}
