// Imports of specific item sheet "sub-types", to ensure their imports cause the `ITEM_SHEET_SUBTYPE` map to be populated. 
import AmbersteelBaseItemSheet from "./ambersteel-base-item-sheet.mjs";
import AmbersteelSkillItemSheet from "./ambersteel-skill-item-sheet.mjs";
import AmbersteelFateCardItemSheet from "./ambersteel-fate-item-sheet.mjs";
import AmbersteelInjuryItemSheet from "./ambersteel-injury-item-sheet.mjs";
import AmbersteelIllnessItemSheet from "./ambersteel-illness-item-sheet.mjs";
import AmbersteelMutationItemSheet from "./ambersteel-mutation-item-sheet.mjs";
// Other imports
import * as SheetUtil from "../../utils/sheet-utility.mjs";

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

      // TODO: Refactor and somehow get rid of the explicit statements. 
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
      } else if (type === "mutation") {
        this._subType = new AmbersteelMutationItemSheet(this);
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

  // TODO: Refactor and make the subtype dictate the title. 
  /**
   * @override
   * @type {String}
   * @see https://foundryvtt.com/api/ItemSheet.html#title
   */
  get title() {
    if (this.item.type === "skill") {
      return `${game.i18n.localize("ambersteel.character.skill.singular")} - ${this.item.name}`;
    } else if (this.item.type === "fate-card") {
      return `${game.i18n.localize("ambersteel.character.beliefSystem.fateSystem.fateCard.label")} - ${this.item.name}`;
    } else if (this.item.type === "item") {
      return `${game.i18n.localize("ambersteel.character.asset.singular")} - ${this.item.name}`;
    } else if (this.item.type === "injury") {
      return `${game.i18n.localize("ambersteel.character.health.injury.singular")} - ${this.item.name}`;
    } else if (this.item.type === "illness") {
      return `${game.i18n.localize("ambersteel.character.health.illness.singular")} - ${this.item.name}`;
    } else if (this.item.type === "mutation") {
      return `${game.i18n.localize("ambersteel.character.health.mutation.singular")} - ${this.item.name}`;
    } else {
      return this.item.name;
    }
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
