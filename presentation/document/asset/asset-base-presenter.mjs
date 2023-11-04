import TransientAsset from "../../../business/document/item/transient-asset.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonTakeItemViewModel from "../../component/button-take-item/button-take-item-viewmodel.mjs";
import Component from "../../layout/component.mjs";
import DocumentPresenter from "../document-presenter.mjs";

/**
 * Presents a `TransientAsset` document in the form of a 
 * embedded list item. 
 * 
 * @property {TransientAsset} document The represented 
 * document instance. 
 * 
 * @extends DocumentPresenter
 */
export default class AssetBasePresenter extends DocumentPresenter {
  buttonTake = new Component({
    template: ButtonTakeItemViewModel.TEMPLATE,
    viewModelFunc: (parent, isEditable, isGM) => {
      return new ButtonTakeItemViewModel({
        id: "take",
        parent: parent,
        target: this.document,
        isEditable: isEditable || isGM,
        withDialog: true,
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
}
