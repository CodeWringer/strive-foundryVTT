import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import SkillItemSheetViewModel from "./skill-item-sheet-viewmodel.mjs";

export default class SkillItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.skill.skill");
  }
  
  /** @override */
  createViewModel(document, context) {
    return new SkillItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
