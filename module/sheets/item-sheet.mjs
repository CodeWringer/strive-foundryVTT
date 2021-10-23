export class AmbersteelItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ambersteel", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const type = this.item.data.type

    if (type != undefined && type != null && type != "") {
      return `systems/ambersteel/templates/item/${type}-item-sheet.html`;
    } else { // Fallback
      return `systems/ambersteel/templates/item/generic-item-sheet.html`;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const data = super.getData();
    const itemData = data.item.data;

    // Retrieve the roll data for TinyMCE editors.
    data.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      data.rollData = actor.getRollData();
    }

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
