import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import RecipeItemSheetViewModel from "./recipe-item-sheet-viewmodel.mjs";

export default class RecipeItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.recipe.recipe");
  }
  
  /** @override */
  createViewModel(document, context) {
    return new RecipeItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
