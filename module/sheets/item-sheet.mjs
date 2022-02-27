import AmbersteelBaseItemSheet from "./subtypes/item/ambersteel-base-item-sheet.mjs";
import AmbersteelSkillItemSheet from "./subtypes/item/ambersteel-skill-item-sheet.mjs";
import AmbersteelFateCardItemSheet from "./subtypes/item/ambersteel-fate-item-sheet.mjs";
import AmbersteelInjuryItemSheet from "./subtypes/item/ambersteel-injury-item-sheet.mjs";
import AmbersteelIllnessItemSheet from "./subtypes/item/ambersteel-illness-item-sheet.mjs";
import * as SheetUtil from "../utils/sheet-utility.mjs";
import ViewModelCollection from "../utils/viewmodel-collection.mjs";

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
   * @private
   * @todo Remove and properly integrate inputs and buttons into the "new" view model system. 
   * @type {ViewModelCollection}
   */
  _inputsAndButtons = undefined;

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

    // Prepare view model. 
    this._viewModel = this.subType.getViewModel(context);
    this._viewModel.applyViewState(this._getViewState(this.item.id));
    this._inputsAndButtons = new ViewModelCollection();

    this.subType.prepareDerivedData(context);

    return context;
  }

  /**
   * Returns the view state. 
   * @param {String} key 
   * @param {Map<String, Object>} globalViewStates 
   * @returns {Object}
   * @private
   */
  _getViewState(key, globalViewStates = game.ambersteel.viewStates) {
    return globalViewStates.get(key) ?? Object.create(null);
  }

  /**
   * Stores the current view state. 
   * @param {String} key 
   * @param {Map<String, Object>} globalViewStates 
   * @private
   */
  _setViewState(key, globalViewStates = game.ambersteel.viewStates) {
    globalViewStates.set(key, this.viewModel.toViewState());
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
    this.viewModel.activateListeners(html, isOwner, isEditable);
    this._inputsAndButtons.activateListeners(html, isOwner, isEditable);

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
    this._setViewState(this.item.id);
    this.viewModel.dispose();
    this._inputsAndButtons.dispose();

    return super.close();
  }
}
