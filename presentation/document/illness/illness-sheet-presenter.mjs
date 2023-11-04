import TransientIllness from "../../../business/document/item/transient-illness.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientIllness` document in the form of a 
 * dedicated sheet. 
 * 
 * @property {TransientIllness} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class IllnessSheetPresenter extends DocumentPresenter {
  /**
   * @param {Object} args 
   * @param {TransientIllness} args.document 
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
            this.document.duration,
            this.document.treatment,
            this.document.treatmentSkill,
          ],
        }),
      ],
    });
  }
}
