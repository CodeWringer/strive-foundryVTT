import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";
// Imports of specific item sheet "sub-types", to ensure their imports cause the `ITEM_SHEET_SUBTYPE` map to be populated. 
import AmbersteelAssetItemSheet from "./asset/ambersteel-asset-item-sheet.mjs";
import AmbersteelSkillItemSheet from "./skill/ambersteel-skill-item-sheet.mjs";
import AmbersteelInjuryItemSheet from "./injury/ambersteel-injury-item-sheet.mjs";
import AmbersteelIllnessItemSheet from "./illness/ambersteel-illness-item-sheet.mjs";
import AmbersteelMutationItemSheet from "./mutation/ambersteel-mutation-item-sheet.mjs";
import AmbersteelScarItemSheet from "./scar/ambersteel-scar-item-sheet.mjs";
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
   * Returns the content container. 
   * 
   * @type {JQuery | undefined}
   * @readonly
   */
  get contentElement() {
    if (isDefined(this._element) !== true) return undefined;

    return this._element.find("section.window-content");
  }

  /**
   * Returns the content container's current scroll value. 
   * 
   * @type {Number | undefined}
   */
  get scrollValue() {
    if (isDefined(this.contentElement) !== true) return undefined;

    return this.contentElement[0].scrollTop;
  }
  /**
   * Sets the content container's current scroll value. 
   * 
   * @param {Number} value
   */
  set scrollValue(value) {
    if (isDefined(this.contentElement) !== true) return;

    this.contentElement[0].scrollTop = value;
  }

  /**
   * @returns {Object}
   * @override
   * @virtual
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
   */
  get template() { return this.subType.template; }

  /**
   * Returns the localized title of this sheet. 
   * @override
   * @type {String}
   * @readonly
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
   */
  getData() {
    const context = super.getData();
    SheetUtil.enrichData(context);

    // Prepare a new view model instance. 
    game.ambersteel.logger.logPerf(this, "item.getData (getViewModel)", () => {
      this._viewModel = this.subType.getViewModel(context, context.item, this);
    });
    game.ambersteel.logger.logPerf(this, "item.getData (readAllViewState)", () => {
      this._viewModel.readAllViewState();
    });
    context.viewModel = this._viewModel;
    
    return context;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    const isOwner = (this.actor ?? this.item).isOwner;
    
    await game.ambersteel.logger.logPerfAsync(this, "item.activateListeners (subType)", async () => {
      await this.subType.activateListeners(html);
    });
    await game.ambersteel.logger.logPerfAsync(this, "item.activateListeners (viewModel)", async () => {
      await this.viewModel.activateListeners(html);
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
