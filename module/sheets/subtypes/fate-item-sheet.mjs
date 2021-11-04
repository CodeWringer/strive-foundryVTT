import BaseItemSheet from "./base-item-sheet.mjs";

export default class FateItemSheet extends BaseItemSheet {
  /** @override */
  get template() {
    return "systems/ambersteel/templates/item/fate-card-item-sheet.hbs";
  }

  /** @override */
  prepareDerivedData(context) {
    super.prepareDerivedData(context);
    
    context.data.localizableName = "ambersteel.fateSystem.cardsNames." + context.name;
    context.data.localizableDescription = "ambersteel.fateSystem.cardDescriptions." + context.name;
  }
}