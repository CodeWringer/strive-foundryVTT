import * as NumberSpinner from "../components/number-spinner.mjs";
import AmbersteelNpcActorSheet from "./subtypes/actor/ambersteel-npc-actor-sheet.mjs";
import AmbersteelPcActorSheet from "./subtypes/actor/ambersteel-pc-actor-sheet.mjs";

export class AmbersteelActorSheet extends ActorSheet {
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
      const type = data.actor.type;

      if (type === "pc") {
        this._subType = new AmbersteelPcActorSheet(this);
      } else if (type === "npc") {
        this._subType = new AmbersteelNpcActorSheet(this);
      } else {
        throw `Actor subtype ${type} is unrecognized!`
      }
    }
    return this._subType;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ambersteel", "sheet", "actor"],
      width: 600,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
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
   * Returns an object that represents sheet and enriched actor data. 
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
    // In templates that implement it, this flag indicates whether the current user is a GM. 
    context.isGM = game.user.isGM;

    this.subType.prepareDerivedData(context);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    const isOwner = this.actor.isOwner;
    const isEditable = this.isEditable;

    // General listeners. 
    NumberSpinner.activateListeners(html, this, isOwner, isEditable);

    // Subtype listeners. 
    this.subType.activateListeners(html, isOwner, isEditable);
  }
}
