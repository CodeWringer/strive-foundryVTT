import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";

export default class AmbersteelInjuryItemSheet extends AmbersteelBaseItemSheet {
  /** @override */
  get template() {
    return "systems/ambersteel/templates/item/injury/injury-item-sheet.hbs";
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);
    
    context.data.localizableName = "ambersteel.injuries." + context.name;
    context.data.localizableDescription = "ambersteel.injuries." + context.name;
  }
}