import * as NumberSpinner from "../components/number-spinner.mjs";
import * as SkillUtil from '../utils/skill-utility.mjs';
import * as ItemUtil from '../utils/item-utility.mjs';

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
    const path = "systems/ambersteel/templates/item";
    const type = this.item.data.type;

    if (type != undefined && type != null && type != "") {
      return `${path}/${type}-item-sheet.hbs`;
    } else { // Fallback
      return `${path}/item-item-sheet.hbs`;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();
    const type = context.item.type;
    const itemData = context.item.data;
    context.CONFIG = CONFIG.ambersteel;

    context.isEditable = context.editable;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = itemData.data;
    context.flags = itemData.flags;

    if (type == "skill") {
      SkillUtil.prepareDerivedData(context);
    }

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    const isOwner = this.item.isOwner;
    const isEditable = this.isEditable;

    ItemUtil.activateListeners(html, this, isOwner, isEditable);
    SkillUtil.activateListeners(html, this, isOwner, isEditable);
    NumberSpinner.activateListeners(html, this, isOwner, isEditable);

    if (!isOwner) return;
    if (!isEditable) return;
  }
}
