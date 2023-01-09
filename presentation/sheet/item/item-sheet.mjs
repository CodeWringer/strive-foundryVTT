import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";
// Imports of specific item sheet "sub-types", to ensure their imports cause the `ITEM_SHEET_SUBTYPE` map to be populated. 
import AmbersteelAssetItemSheet from "./asset/ambersteel-asset-item-sheet.mjs";
import AmbersteelSkillItemSheet from "./skill/ambersteel-skill-item-sheet.mjs";
import AmbersteelInjuryItemSheet from "./injury/ambersteel-injury-item-sheet.mjs";
import AmbersteelIllnessItemSheet from "./illness/ambersteel-illness-item-sheet.mjs";
import AmbersteelMutationItemSheet from "./mutation/ambersteel-mutation-item-sheet.mjs";
import AmbersteelFateItemSheet from "./fate-card/ambersteel-fate-item-sheet.mjs";
// Other imports
import * as SheetUtil from "../sheet-utility.mjs";
import { SYSTEM_ID } from "../../../system-id.mjs";

export class AmbersteelItemSheet extends ItemSheet {
  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   * @type {AmbersteelBaseItemSheet}
   * @readonly
   */
  get subType() {
    const type = this.item.type;
    const enhancer = ITEM_SHEET_SUBTYPE.get(type);
    
    if (enhancer === undefined) {
      throw new Error(`InvalidTypeException: Item sheet subtype ${type} is unrecognized!`);
    }

    return enhancer;
  }

  /**
   * @returns {Object}
   * @override
   * @virtual
   * @see https://foundryvtt.com/api/ItemSheet.html#.defaultOptions
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: [SYSTEM_ID, "sheet", "item"],
      width: 600,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /**
   * Returns the template path. 
   * @returns {String} Path to the template. 
   * @virtual
   * @override
   * @readonly
   * @see https://foundryvtt.com/api/DocumentSheet.html#template
   */
  get template() { return this.subType.template; }

  /**
   * Returns the localized title of this sheet. 
   * @override
   * @type {String}
   * @readonly
   * @see https://foundryvtt.com/api/ItemSheet.html#title
   */
  get title() { return `${this.subType.title} - ${this.item.name}` }

  /**
   * @type {ViewModel}
   * @private
   */
  _viewModel = undefined;
  /**
   * @type {ViewModel}
   * @readonly
   */
  get viewModel() { return this._viewModel; }

  /** 
   * Returns an object that represents sheet and enriched item data. 
   * 
   * Enriched means, it contains derived data and convenience properties. 
   * 
   * This method is called *before* the sheet is rendered. 
   * @returns {Object} The enriched context object. 
   * @override 
   * @see https://foundryvtt.com/api/FormApplicatiocn.html#getData
   */
  getData() {
    const context = super.getData();
    SheetUtil.enrichData(context);

    // Prepare a new view model instance. 
    game.ambersteel.logger.logPerf(this, "item.getData (getViewModel)", () => {
      this._viewModel = this.subType.getViewModel(context, context.item);
    });
    game.ambersteel.logger.logPerf(this, "item.getData (readViewState)", () => {
      this._viewModel.readViewState();
    });
    context.viewModel = this._viewModel;
    
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const isOwner = (this.actor ?? this.item).isOwner;
    const isEditable = this.isEditable;
    
    game.ambersteel.logger.logPerf(this, "item.activateListeners (subType)", () => {
      this.subType.activateListeners(html, isOwner, isEditable);
    });
    game.ambersteel.logger.logPerf(this, "item.activateListeners (viewModel)", () => {
      this.viewModel.activateListeners(html, isOwner, isEditable);
    });

    if (!isOwner) return;

    // Drag events for macros.
    const handler = ev => this._onDragStart(ev);
    html.find('li.item').each((i, li) => {
      if (li.classList.contains("inventory-header")) return;
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
    });
  }

  /**
   * @override
   * @see https://foundryvtt.com/api/FormApplication.html#close
   */
  async close() {
    if (this._viewModel !== undefined && this._viewModel !== null) {
      this._viewModel.writeViewState();
    }
    
    return super.close();
  }
}
