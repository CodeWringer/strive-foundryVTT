import AmbersteelBaseItemSheet from "./subtypes/item/ambersteel-base-item-sheet.mjs";
import AmbersteelSkillItemSheet from "./subtypes/item/ambersteel-skill-item-sheet.mjs";
import AmbersteelFateCardItemSheet from "./subtypes/item/ambersteel-fate-item-sheet.mjs";
import AmbersteelInjuryItemSheet from "./subtypes/item/ambersteel-injury-item-sheet.mjs";
import AmbersteelIllnessItemSheet from "./subtypes/item/ambersteel-illness-item-sheet.mjs";
import * as SheetUtil from "../utils/sheet-utility.mjs";

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
      } else if (type === "injury") {
        this._subType = new AmbersteelInjuryItemSheet(this);
      } else if (type === "illness") {
        this._subType = new AmbersteelIllnessItemSheet(this);
      } else {
        throw `ItemSheet subtype ${type} is unrecognized!`
      }
    }
    return this._subType;
  }

  /**
   * @returns {Object}
   * @override
   * @virtual
   * @see https://foundryvtt.com/api/ItemSheet.html#.defaultOptions
   */
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
   * @see https://foundryvtt.com/api/DocumentSheet.html#template
   */
  get template() {
    return this.subType.template;
  }

  /**
   * @type {SheetViewModelCollection}
   * @private
   */
  _viewModels = undefined;
  /**
   * @returns {SheetViewModelCollection}
   */
  get viewModels() { return this._viewModels; }

  constructor() {
    this.viewModels = new SheetViewModelCollection(this);
  }

  /** 
   * Returns an object that represents sheet and enriched item data. 
   * 
   * Enriched means, it contains derived data and convenience properties. 
   * @returns {Object} The enriched context object. 
   * @override 
   * @see https://foundryvtt.com/api/FormApplicatiocn.html#getData
   */
  getData() {
    const context = super.getData();

    // Add the config to the context object as a convenience property. 
    context.CONFIG = CONFIG.ambersteel;
    // Add the game to the context object as a convenience property. 
    context.game = game;
    // In templates that implement it, this flag indicates whether the current user is the owner of the sheet. 
    context.isOwner = context.owner;
    // In templates that implement it, this flag indicates whether the current user is a GM. 
    context.isGM = game.user.isGM;
    // In templates that implement it, this flag determines whether data on the sheet 
    // can be edited. 
    context.isEditable = ((context.item.data.data.isCustom && context.isOwner) || context.isGM) && context.editable;
    // In templates that implement it, this flag determines whether the sheet data can be 
    // sent to the chat. 
    context.isSendable = true;

    this.subType.prepareDerivedData(context);

    return context;
  }

  /**
   * @override
   * @see https://foundryvtt.com/api/FormApplication.html#activateListeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Activate view model bound event listeners. 
    SheetUtil.activateListeners(html, this);

    // TOOD: Remove?
    // Subtype listeners. 
    // this.subType.activateListeners(html, isOwner, isEditable);
  }

  /**
   * @param force 
   * @param options 
   * @override
   * @see https://foundryvtt.com/api/ItemSheet.html#render
   */
  render(force, options) {
    super.render(force, options);
  }

  /**
   * @override
   * @see https://foundryvtt.com/api/FormApplication.html#close
   */
  async close() {
    this.viewModels.clear();
    return super.close();
  }
}
