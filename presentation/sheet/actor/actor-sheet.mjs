import { SYSTEM_ID } from "../../../system-id.mjs";
import FoundryWrapper from "../../../foundry-interop/foundry-wrapper.mjs";
import { SheetUtil } from "../sheet-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import PlainActorSheet from "./plain/plain-actor-sheet.mjs";
import ActorSheetSubType from "./actor-sheet-subtype.mjs";
import NpcActorSheet from "./npc/npc-actor-sheet.mjs";
import PcActorSheet from "./pc/pc-actor-sheet.mjs";
import ItemDropData from "../item/base/item-drop-data.mjs";
import { GENERAL_DOCUMENT_TYPES } from "../../../business/document/general-document-types.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { DOCUMENT_COLLECTION_SOURCES } from "../../../business/document/document-fetcher/document-collection-source.mjs";
import { business } from "../../../business/_module.mjs";

/**
 * Global definition of an Actor sheet. This is what FoundryVTT instantiates to render 
 * an Actor sheet. 
 * 
 * Unfortunately, FoundryVTT only allows registering a single ActorSheet class definition. 
 * This prevents OOP, as it is not possible to register specific ActorSheet derivatives 
 * for each Actor document type. To circumvent this limitation and enable OOP after all, 
 * STRIVE introduces so-called sub-types. 
 * 
 * There is one sub-type for each Actor document type. ALL of these sub-types MUST be 
 * registered in the static `SUB_TYPES` property! 
 * 
 * @extends ActorSheet
 * @see https://foundryvtt.com/api/v12/classes/client.ActorSheet.html
 * 
 * @property {ViewModel} viewModel
 */
export class GameSystemActorSheet extends foundry.appv1.sheets.ActorSheet {
  /**
   * Returns a map of `ActorSheet` sub-types and their factory functions. 
   * 
   * @type {Map<String, ActorSheetSubType>}
   * @static
   * @readonly
   * @private
   */
  static get SUB_TYPES() {
    return new Map([
      [business.model.const.ACTOR_TYPES.PLAIN, new PlainActorSheet()],
      [business.model.const.ACTOR_TYPES.NPC, new NpcActorSheet()],
      [business.model.const.ACTOR_TYPES.PC, new PcActorSheet()],
    ]);
  }

  /**
   * Returns the sub-type. 
   * 
   * @type {ActorSheetSubType}
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
   * 
   * @type {String}
   * @virtual
   * @override
   * @readonly
   */
  get template() { return this.subType.template; }

  /**
   * Returns the localized title of this sheet. 
   * 
   * @type {String}
   * @override
   * @readonly
   */
  get title() { return this.subType.getTitle(this.actor); }

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

    // Ensure view model. 
    this.viewModel = this.subType.getViewModel(context, context.actor, this);
    this.viewModel.readAllViewState();
    context.viewModel = this.viewModel;
    
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
    const itemId = data.uuid.substring(data.uuid.lastIndexOf(".") + 1);
    let itemDocument = await new DocumentFetcher().find({
      id: itemId,
      documentType: GENERAL_DOCUMENT_TYPES.ITEM,
      includeLocked: true,
      source: DOCUMENT_COLLECTION_SOURCES.all,
    });

    if (!ValidationUtil.isDefined(itemDocument)) {
      game.strive.logger.logWarn(`Failed to find Item document with ID '${itemId}}'`)
      return;
    }

    itemDocument = itemDocument.getTransientObject();

    let owningDocument;
    if (ValidationUtil.isDefined(itemDocument.owningDocument)) {
      owningDocument = {
        id: itemDocument.owningDocument.id,
        contentType: itemDocument.owningDocument.type,
      };
    }

    this.viewModel.onReceiveDroppedItem(
      new ItemDropData({
        id: itemId,
        contentType: itemDocument.type,
        owningDocument: owningDocument,
      })
    );
  }

  /** @override */
  _getHeaderButtons() {
    const baseButtons = super._getHeaderButtons();
    return this.subType.getHeaderButtons(this).concat(baseButtons);
  }
}
