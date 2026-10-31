import { StringUtil } from "../../../../common/util/string-utility.mjs";
import GeneralDocumentApplication from "../../general/general-document-application.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ExpertiseItemSheetViewModel from "./expertise-item-sheet-viewmodel.mjs";

export default class ExpertiseItemSheet extends GeneralDocumentApplication {
  /** @override */
  static PARTS = {
    form: {
      template: TEMPLATES.application.item.base.sheet,
    },
  }

  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.expertise.expertise");
  }

  /**
   * @param {Object} args 
   * @param {TransientDocument} args.document 
   * @param {DOCUMENT_CONTEXT} args.documentContext 
   * @returns {ExpertiseItemSheetViewModel}
   * @override
   */
  createViewModel(args) {
    return new ExpertiseItemSheetViewModel({
      id: this.id,
      document: args.document,
      sheet: this,
      context: args.documentContext,
    });
  }
}
