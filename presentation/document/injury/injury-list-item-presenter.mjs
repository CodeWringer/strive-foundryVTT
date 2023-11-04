import TransientInjury from "../../../business/document/item/transient-injury.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientInjury` document in the form of a 
 * embedded list item. 
 * 
 * @property {TransientInjury} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class InjuryListItemPresenter extends DocumentPresenter {
  /**
   * @param {Object} args 
   * @param {TransientInjury} args.document 
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
            this.document.state,
            this.buttonDelete,
          ],
        }),
        this.document.description,
        new RowLayout({
          content: [
            this.document.treatmentSkill,
            this.document.requiredSupplies,
          ],
        }),
        new RowLayout({
          content: [
            this.document.obstaclePatchUp,
            this.document.obstacleTreatment,
          ],
        }),
        new RowLayout({
          content: [
            this.document.timeToHeal,
            this.document.timeToHealTreated,
            this.document.selfPatchUp,
          ],
        }),
        new RowLayout({
          content: [
            this.document.scar,
            this.document.limit,
          ],
        }),
      ],
    });
  }
}
