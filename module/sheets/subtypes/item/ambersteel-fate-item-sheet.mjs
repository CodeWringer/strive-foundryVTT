import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";

export default class AmbersteelFateItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return "systems/ambersteel/templates/item/fate-card/fate-card-item-sheet.hbs";
  }
}