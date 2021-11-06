import * as NumberSpinner from "../components/number-spinner.mjs";
import AmbersteelBaseItemSheet from "./subtypes/item/ambersteel-base-item-sheet.mjs";
import AmbersteelSkillItemSheet from "./subtypes/item/ambersteel-skill-item-sheet.mjs";
import AmbersteelFateCardItemSheet from "./subtypes/item/ambersteel-fate-item-sheet.mjs";

export class AmbersteelItemSheet extends ItemSheet {
  /**
   * @private
   */
  _subType = undefined;
  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   */
  get subType() {
    if (!this._subType) {
      const data = super.getData();
      const type = data.item.type;

      if (type === "skill") {
        this._subType = new AmbersteelSkillItemSheet(this);
      } else if (type === "fate-card") {
        this._subType = new AmbersteelFateCardItemSheet(this);
      } else if (type === "item") {
        this._subType = new AmbersteelBaseItemSheet(this);
      } else {
        throw `ItemSheet subtype ${type} is unrecognized!`
      }
    }
    return this._subType;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ambersteel", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /**
   * Returns the template path. 
   * @returns {String} Path to the template. 
   * @virtual
   * @override
   */
  get template() {
    return this.subType.template;
  }

  /** 
   * Returns an object that represents sheet and enriched item data. 
   * 
   * Enriched means, it contains derived data and convenience properties. 
   * @returns {Object} The enriched context object. 
   * @override 
   */
  getData() {
    const context = super.getData();
    
    // Add the config to the context object as a convenience property. 
    context.CONFIG = CONFIG.ambersteel;
    // In templates that implement it, this flag determines whether data on the sheet 
    // can be edited. 
    context.isEditable = context.editable;
    // In templates that implement it, this flag determines whether the sheet data can be 
    // sent to the chat. 
    context.isSendable = true;

    this.subType.prepareDerivedData(context);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    const isOwner = this.item.isOwner;
    const isEditable = this.isEditable;
    
    // General listeners. 
    NumberSpinner.activateListeners(html, this, isOwner, isEditable);

    // Subtype listeners. 
    this.subType.activateListeners(html, isOwner, isEditable);
  }
}
