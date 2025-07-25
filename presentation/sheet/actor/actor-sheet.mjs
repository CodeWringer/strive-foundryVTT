import GameSystemBaseActorSheet from "./game-system-base-actor-sheet.mjs";
import GameSystemNpcActorSheet from "./game-system-npc-actor-sheet.mjs";
import GameSystemPcActorSheet from "./game-system-pc-actor-sheet.mjs";
import { SYSTEM_ID } from "../../../system-id.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import { ACTOR_TYPES } from "../../../business/document/actor/actor-types.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";
import { SheetUtil } from "../sheet-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import SendToChatHandler from "../../utility/send-to-chat-handler.mjs";

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
    if (ValidationUtil.isDefined(this._element) !== true) return undefined;

    return this._element.find("section.window-content");
  }

  /**
   * Returns the content container's current scroll value. 
   * 
   * @type {Number | undefined}
   */
  get scrollValue() {
    if (ValidationUtil.isDefined(this.contentElement) !== true) return undefined;

    return this.contentElement[0].scrollTop;
  }
  /**
   * Sets the content container's current scroll value. 
   * 
   * @param {Number} value
   */
  set scrollValue(value) {
    if (ValidationUtil.isDefined(this.contentElement) !== true) return;

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
      width: 650,
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
    this._viewModel = this.subType.getViewModel(context, context.actor, this);
    this._viewModel.readAllViewState();

    context.viewModel = this._viewModel;
    
    return context;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    await this.subType.activateListeners(html);
    await this.viewModel.activateListeners(html);
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
      // For NPCs, ensure skills have at least level one. 
      if (this.actor.type === ACTOR_TYPES.NPC) {
        creationData.system.level = 1;
      }

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

  /** @override */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    if (game.user.isGM || this.actor.isOwner) {
      buttons.splice(0, 0, {
        class: "send-to-chat",
        icon: "fas fa-comments",
        onclick: async () => {
          await new SendToChatHandler().prompt({
            target: this.viewModel.document,
            dialogTitle: game.i18n.localize("system.general.sendToChat"),
          });
        },
      });
    }
    if ((game.user.isGM || this.actor.isOwner) && this.actor.type !== ACTOR_TYPES.PLAIN) {
      buttons.splice(0, 0, {
        label: game.i18n.localize("system.character.edit"),
        class: "edit-meta",
        icon: "fas fa-cog",
        onclick: async () => {
          await this.viewModel.promptConfigure();
        },
      });
    }
    return buttons;
  }
}
