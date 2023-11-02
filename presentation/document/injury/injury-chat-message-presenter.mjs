import TransientInjury from "../../../business/document/item/transient-injury.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientInjury` document in the form of a 
 * chat message. 
 * 
 * @property {TransientInjury} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class InjuryChatMessagePresenter extends DocumentPresenter {
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
            this.document.img,
            this.document.name,
            this.document.state,
          ],
        }),
        this.document.description,
        this.document.treatmentSkill,
        this.document.requiredSupplies,
        this.document.obstaclePatchUp,
        this.document.obstacleTreatment,
        this.document.timeToHeal,
        this.document.timeToHealTreated,
        this.document.selfPatchUp,
        this.document.scar,
        this.document.limit,
      ],
    });
  }
}
