import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import ProjectItemSheetViewModel from "./project-item-sheet-viewmodel.mjs";

export default class ProjectItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.project.project");
  }
  
  /** @override */
  createViewModel(document, context) {
    return new ProjectItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
