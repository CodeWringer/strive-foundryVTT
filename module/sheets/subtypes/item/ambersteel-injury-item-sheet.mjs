import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";

export default class AmbersteelInjuryItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return "systems/ambersteel/templates/item/injury/injury-item-sheet.hbs";
  }
}