import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import { TEMPLATES } from "../../../templatePreloader.mjs";

export default class AmbersteelFateItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return TEMPLATES.FATE_CARD_ITEM_SHEET;
  }
}