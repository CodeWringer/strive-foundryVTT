// Imports of specific actor sheet "sub-types", to ensure their imports cause the `ACTOR_SHEET_SUBTYPE` map to be populated. 
import AmbersteelBaseActorSheet from "./ambersteel-base-actor-sheet.mjs";
import AmbersteelNpcActorSheet from "./ambersteel-npc-actor-sheet.mjs";
import AmbersteelPcActorSheet from "./ambersteel-pc-actor-sheet.mjs";
import { ACTOR_SHEET_SUBTYPE } from "./actor-sheet-subtype.mjs";
// Other imports
import * as SheetUtil from "../../utils/sheet-utility.mjs";

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
      } else if (type === "plain") {
        this._subType = new AmbersteelBaseActorSheet(this);
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
      width: 700,
      height: 800,
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
  get template() { return this.subType.template; }

  /**
   * @override
   * @type {String}
   * @see https://foundryvtt.com/api/ActorSheet.html#title
   */
  get title() {
    if (this.actor.type === "pc") {
      return `${game.i18n.localize("ambersteel.general.actor.pc.label")} - ${this.actor.name}`;
    } else if (this.actor.type === "npc") {
      return `${game.i18n.localize("ambersteel.general.actor.npc.label")} - ${this.actor.name}`;
    } else if (this.actor.type === "plain") {
      return `${game.i18n.localize("ambersteel.general.actor.plain.label")} - ${this.actor.name}`;
    } else {
      return this.actor.name;
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
   * Returns an object that represents sheet and enriched actor data. 
   * 
   * Enriched means, it contains derived data and convenience properties. 
   * 
   * This method is called *before* the sheet is rendered. 
   * @returns {Object} The enriched context object. 
   * @override 
   * @see https://foundryvtt.com/api/FormApplication.html#getData
   */
  getData() {
    const context = super.getData();
    SheetUtil.enrichData(context);

    // Whenever the sheet is re-rendered, its view model is completely disposed and re-instantiated. 
    // Dispose of the view model, if it exists. 
    this._tryDisposeViewModel();
    // Prepare a new view model instance. 
    this._viewModel = this.subType.getViewModel(context);
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

    // Drag events for macros.
    const handler = ev => this._onDragStart(ev);
    html.find('li.item').each((i, li) => {
      if (li.classList.contains("inventory-header")) return;
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
    });

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
