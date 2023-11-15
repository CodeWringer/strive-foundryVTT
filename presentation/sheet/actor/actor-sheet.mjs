import { ACTOR_SHEET_SUBTYPE } from "./actor-sheet-subtype.mjs";
// Imports of specific actor sheet "sub-types", to ensure their imports cause the `ACTOR_SHEET_SUBTYPE` map to be populated. 
import AmbersteelBaseActorSheet from "./ambersteel-base-actor-sheet.mjs";
import AmbersteelNpcActorSheet from "./ambersteel-npc-actor-sheet.mjs";
import AmbersteelPcActorSheet from "./ambersteel-pc-actor-sheet.mjs";
import * as SheetUtil from "../sheet-utility.mjs";
import { SYSTEM_ID } from "../../../system-id.mjs";
import { isDefined } from "../../../business/util/validation-utility.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";

export class AmbersteelActorSheet extends ActorSheet {
  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   * @type {AmbersteelBaseActorSheet}
   * @readonly
   */
  get subType() {
    const type = this.actor.type;
    const enhancer = ACTOR_SHEET_SUBTYPE.get(type);
    
    if (enhancer === undefined) {
      throw new Error(`InvalidTypeException: Actor sheet subtype ${type} is unrecognized!`);
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
   * @see https://foundryvtt.com/api/ActorSheet.html#.defaultOptions
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: [SYSTEM_ID, "sheet", "actor"],
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
   * @readonly
   * @see https://foundryvtt.com/api/DocumentSheet.html#template
   */
  get template() { return this.subType.template; }

  /**
   * Returns the localized title of this sheet. 
   * @override
   * @type {String}
   * @readonly
   * @see https://foundryvtt.com/api/ActorSheet.html#title
   */
  get title() { return `${this.subType.title} - ${this.actor.name}` }

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

    // Prepare a new view model instance. 
    game.ambersteel.logger.logPerf(this, "actor.getData (getViewModel)", () => {
      this._viewModel = this.subType.getViewModel(context, context.actor, this);
    });
    game.ambersteel.logger.logPerf(this, "actor.getData (readViewState)", () => {
      this._viewModel.readViewState();
    });

    context.viewModel = this._viewModel;
    
    return context;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    await game.ambersteel.logger.logPerfAsync(this, "actor.activateListeners (subType)", async () => {
      await this.subType.activateListeners(html);
    });
    await game.ambersteel.logger.logPerfAsync(this, "actor.activateListeners (viewModel)", async () => {
      await this.viewModel.activateListeners(html);
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

  /** @override */
  async _onDropItem(event, data) {
    const templateId = data.uuid.split(".")[1];

    const docFetcher = new DocumentFetcher();
    const templateItem = await docFetcher.find({
      id: templateId,
      documentType: data.type,
      includeLocked: true,
    });

    if (templateItem === undefined) {
      return false;
    }

    const creationData = {
      name: templateItem.name,
      type: templateItem.type,
      system: {
        ...templateItem.system,
        isCustom: false,
      }
    };

    if (this.actor.type === "npc") {
      const npcData = this.actor.getTransientObject();
      if (npcData.progressionVisible === false) {
        creationData.system.level = 1;
      }
    }

    const existingItem = this.actor.items.find(it => it.id === templateId || it.name === templateItem.name);
    if (existingItem === undefined) {
      return await Item.create(creationData, { parent: this.actor });
    } else {
      await existingItem.update(creationData);
      return existingItem;
    }
  }
}
