import { StringUtil } from "../../../../common/util/string-utility.mjs";
import GeneralDocumentApplication from "../../general/general-document-application.mjs";
import { TEMPLATES } from "../../templates.mjs";
import MomentumActionItemSheetViewModel from "./momentum-action-item-sheet-viewmodel.mjs";

export default class MomentumActionItemSheet extends GeneralDocumentApplication {
  /** @override */
  static PARTS = {
    form: {
      template: TEMPLATES.application.item.base.sheet,
    },
  }

  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.momentumAction.momentumAction");
  }

  /**
   * @param {Object} args 
   * @param {Document} args.document 
   * @returns {MomentumActionItemSheetViewModel}
   * @override
   */
  createViewModel(args) {
    return new MomentumActionItemSheetViewModel({
      id: this.id,
      document: args.document,
      sheet: this,
    });
  }
}
