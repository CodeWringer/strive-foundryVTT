import ViewModelCollection from "../utils/viewmodel-collection.mjs";
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
   * @type {ViewModelCollection}
   * @private
   */
  _viewModels = undefined;
  /**
   * @returns {ViewModelCollection}
   */
  get viewModels() { return this._viewModels; }

  /**
   * An object representing a map of view states. Any view models this collection contains can store their view state in this 
   * map. The map will be persisted (for the current session) on a global object. 
   * @type {Object}
   * @private
   */
  viewState = undefined;

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

    // Prepare view model collection. 
    this._viewModels = new ViewModelCollection();

    // Fetch view state from global collection. 
    const key = this.item.id;
    this.viewState = this._getViewState(key);
    // Make view state easily accessible. 
    context.viewState = this.viewState;

    SheetUtil.enrichData(context);

    this.subType.prepareDerivedData(context);

    return context;
  }

  /**
   * Ensures a view state for this sheet instance exists and then returns it. 
   * @param {String} key 
   * @param {Map<String, Object>} globalViewStates 
   * @returns {Object}
   * @private
   */
  _getViewState(key, globalViewStates = game.ambersteel.viewStates) {
    let viewState = globalViewStates.get(key);
    if (viewState !== undefined) {
      viewState = viewState;
    } else {
      viewState = Object.create(null);
      globalViewStates.set(key, viewState);
    }
    return viewState;
  }

  /**
   * @override
   * @see https://foundryvtt.com/api/FormApplication.html#activateListeners
   * 
   * This method is called *after* the sheet is rendered. 
   */
  activateListeners(html) {
    super.activateListeners(html);

    const isOwner = (this.actor ?? this.item).isOwner;
    const isEditable = this.isEditable;

    // Activate view model bound event listeners. 
    this.viewModels.activateListeners(html, isOwner, isEditable);

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
    this.viewModels.dispose();
    return super.close();
  }
}
