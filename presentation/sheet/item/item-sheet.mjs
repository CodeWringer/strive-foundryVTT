import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";
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

    // Whenever the sheet is re-rendered, its view model is completely disposed and re-instantiated. 
    // Dispose of the view model, if it exists. 
    this._tryDisposeViewModel();
    // Prepare a new view model instance. 
    this._viewModel = this.subType.getViewModel(context, context.item);
    this._viewModel.readViewState();
    context.viewModel = this._viewModel;
    
    this.subType.prepareDerivedData(context);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const isOwner = (this.actor ?? this.item).isOwner;
    const isEditable = this.isEditable;
    
    this.subType.activateListeners(html, isOwner, isEditable);

    // Activate view model bound event listeners. 
    this.viewModel.activateListeners(html, isOwner, isEditable);

    // -------------------------------------------------------------
    if (!isOwner) return;
    // -------------------------------------------------------------
    if (!isEditable) return;
  }

  /**
   * @override
   * @see https://foundryvtt.com/api/FormApplication.html#close
   */
  async close() {
    this._tryDisposeViewModel();

    return super.close();
  }

  /**
   * Disposes of the view model, if possible. 
   * 
   * Will silently return, if there is no view model instance to dispose. 
   * @private
   * @async
   */
  _tryDisposeViewModel() {
    if (this._viewModel !== undefined && this._viewModel !== null) {
      // Write out state to persist, before disposing the view model. 
      this._viewModel.writeViewState();
      try {
        this._viewModel.dispose();
      } catch (e) {
        game.ambersteel.logger.logWarn(e);
      }
    }
    this._viewModel = null;
  }
}
