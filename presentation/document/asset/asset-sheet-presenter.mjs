import TransientAsset from "../../../business/document/item/transient-asset.mjs";
import ButtonTakeItemViewModel from "../../component/button-take-item/button-take-item-viewmodel.mjs";
import Component from "../../layout/component.mjs";
import { ColumnLayout, RowLayout } from "../../layout/layout.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientAsset` document in the form of a 
 * dedicated sheet. 
 * 
 * @property {TransientAsset} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class AssetSheetPresenter extends DocumentPresenter {
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

  /**
   * @param {Object} args 
   * @param {TransientAsset} args.document 
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
            this.buttonTake,
          ],
        }),
        new RowLayout({
          content: [
            this.document.description,
          ],
        }),
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
