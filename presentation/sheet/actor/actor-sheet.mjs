import GameSystemBaseActorSheet from "./game-system-base-actor-sheet.mjs";
import GameSystemNpcActorSheet from "./game-system-npc-actor-sheet.mjs";
import GameSystemPcActorSheet from "./game-system-pc-actor-sheet.mjs";
import * as SheetUtil from "../sheet-utility.mjs";
import { SYSTEM_ID } from "../../../system-id.mjs";
import { isDefined } from "../../../business/util/validation-utility.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import { ACTOR_TYPES } from "../../../business/document/actor/actor-types.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";

export class GameSystemActorSheet extends ActorSheet {
  /**
   * Returns a map of `ActorSheet` sub-types and their factory functions. 
   * 
   * @type {Map<String, Function<TransientBaseActor>>}
   * @static
   * @readonly
   * @private
   */
  static get SUB_TYPES() {
    return new Map([
      [ACTOR_TYPES.PLAIN, new GameSystemBaseActorSheet()],
      [ACTOR_TYPES.NPC, new GameSystemNpcActorSheet()],
      [ACTOR_TYPES.PC, new GameSystemPcActorSheet()],
    ]);
  }

  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   * @type {GameSystemBaseActorSheet}
   * @readonly
   */
  get subType() {
    const type = this.actor.type;
    const enhancer = GameSystemActorSheet.SUB_TYPES.get(type);
    
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
    return new FoundryWrapper().mergeObject(super.defaultOptions, {
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
    game.strive.logger.logPerf(this, "actor.getData (getViewModel)", () => {
      this._viewModel = this.subType.getViewModel(context, context.actor, this);
    });
    game.strive.logger.logPerf(this, "actor.getData (readAllViewState)", () => {
      this._viewModel.readAllViewState();
    });

    context.viewModel = this._viewModel;
    
    return context;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    await game.strive.logger.logPerfAsync(this, "actor.activateListeners (subType)", async () => {
      await this.subType.activateListeners(html);
    });
    await game.strive.logger.logPerfAsync(this, "actor.activateListeners (viewModel)", async () => {
      await this.viewModel.activateListeners(html);
    });
  }

  /**
   * @override
   * @see https://foundryvtt.com/api/FormApplication.html#close
   */
  async close() {
    if (this.viewModel !== undefined && this.viewModel !== null) {
      this.viewModel.writeViewState();
      this.viewModel.dispose();
    }
    
    return super.close();
  }

  /** @override */
  async _onDropItem(event, data) {
    const templateId = data.uuid.substring(data.uuid.lastIndexOf(".") + 1);

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

    if (templateItem.type === ITEM_TYPES.SKILL) {
      // For NPCs, ensure skills have at least level one, if they have no advancement progression enabled. 
      if (this.actor.type === ACTOR_TYPES.NPC) {
        const npcData = this.actor.getTransientObject();
        if (npcData.progressionVisible === false) {
          creationData.system.level = 1;
        }
      }

      // Update an existing skill, is possible. Only skills support this behavior, as only skills are 
      // expected to be unique on a character. 
      const existingItem = this.actor.items.find(it => it.id === templateId || it.name === templateItem.name);
      if (existingItem !== undefined) {
        creationData.system.level = existingItem.system.level;
        creationData.system.levelModifier = existingItem.system.levelModifier;
        creationData.system.successes = existingItem.system.successes;
        creationData.system.failures = existingItem.system.failures;

        await existingItem.update(creationData);
        return existingItem;
      }
    }

    return await Item.create(creationData, { parent: this.actor });
  }
}
