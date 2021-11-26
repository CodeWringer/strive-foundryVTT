import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";

export default class AmbersteelIllnessItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return TEMPLATES.ILLNESS_ITEM_SHEET;
  }
}