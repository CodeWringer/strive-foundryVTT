export class AmbersteelSkillItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ambersteel", "sheet", "item"],
      width: 520,
      height: 480
    });
  }

  /** @override */
  get template() {
    return "systems/ambersteel/templates/item/skill-item-sheet.hbs";
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const data = super.getData();
    const itemData = data.item.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    data.data = itemData.data;
    data.flags = itemData.flags;

    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
