import AmbersteelNpcActorSheet from "./subtypes/actor/ambersteel-npc-actor-sheet.mjs";
import AmbersteelPcActorSheet from "./subtypes/actor/ambersteel-pc-actor-sheet.mjs";
import * as SheetUtil from "../utils/sheet-utility.mjs";
import ViewModelCollection from "../utils/viewmodel-collection.mjs";

export class AmbersteelActorSheet extends ActorSheet {
  /**
   * @override
   */
  static get itemContextMenu() { 
    return [
      {
        name: game.i18n.localize("ambersteel.labels.delete"),
        icon: '<i class="fas fa-trash"></i>',
        callback: el => {
          const item = this.getItem(el.data("item-id"));
          item.delete();
        }
      }
    ];
  }

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

    // Context menu.
    // TODO: Refactor -> item type specific?
    new ContextMenu(html, ".skill-item", AmbersteelActorSheet.itemContextMenu);

    // Add skill ability. 
    html.find(".ambersteel-skill-ability-create").click(this._onCreateSkillAbility.bind(this));
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

  // TODO: Refactor. Ideally, this would be a static function on the SkillAbility type. 
  /**
   * @param event 
   * @private
   * @async
   */
  async _onCreateSkillAbility(event) {
    event.preventDefault();
    
    const itemId = event.currentTarget.dataset.itemId;
    const skillItem = this.getItem(itemId);
    await skillItem.createSkillAbility();

    this.parent.render();
  }
}
