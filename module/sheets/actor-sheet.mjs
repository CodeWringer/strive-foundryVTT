import SheetViewModelCollection from "./sheet-viewmodel-collection.mjs";
import AmbersteelNpcActorSheet from "./subtypes/actor/ambersteel-npc-actor-sheet.mjs";
import AmbersteelPcActorSheet from "./subtypes/actor/ambersteel-pc-actor-sheet.mjs";
import * as SheetUtil from "../utils/sheet-utility.mjs";

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

  /**
   * @returns {Object}
   * @override
   * @virtual
   * @see https://foundryvtt.com/api/ActorSheet.html#.defaultOptions
   */
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
   * @see https://foundryvtt.com/api/DocumentSheet.html#template
   */
  get template() {
    return this.subType.template;
  }

  /**
   * @type {SheetViewModelCollection}
   * @private
   */
  _viewModels = new SheetViewModelCollection(this);
  /**
   * @returns {SheetViewModelCollection}
   */
  get viewModels() { return this._viewModels; }

  /** 
   * Returns an object that represents sheet and enriched actor data. 
   * 
   * Enriched means, it contains derived data and convenience properties. 
   * @returns {Object} The enriched context object. 
   * @override 
   * @see https://foundryvtt.com/api/FormApplication.html#getData
   */
  getData() {
    const context = super.getData();

    SheetUtil.enrichData(context);

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
