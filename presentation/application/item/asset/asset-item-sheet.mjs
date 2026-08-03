import { StringUtil } from "../../../../common/util/string-utility.mjs";
import BaseItemSheet from "../base/sheet/base-item-sheet.mjs";
import AssetItemSheetViewModel from "./asset-item-sheet-viewmodel.mjs";

export default class AssetItemSheet extends BaseItemSheet {
  /** @override */
  get localizedDocumentType() {
    return StringUtil.getLoca("system.item.asset.asset");
  }
  
  /** @override */
  createViewModel(document, context) {
    return new AssetItemSheetViewModel({
      id: this.id,
      document: document,
      sheet: this,
      context: context,
    });
  }
}
