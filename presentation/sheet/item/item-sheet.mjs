import * as SheetUtil from "../sheet-utility.mjs";
import { SYSTEM_ID } from "../../../system-id.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import AssetItemSheet from "./asset/asset-item-sheet.mjs";
import FateItemSheet from "./fate-card/fate-item-sheet.mjs";
import IllnessItemSheet from "./illness/illness-item-sheet.mjs";
import InjuryItemSheet from "./injury/injury-item-sheet.mjs";
import MutationItemSheet from "./mutation/mutation-item-sheet.mjs";
import ScarItemSheet from "./scar/scar-item-sheet.mjs";
import SkillItemSheet from "./skill/skill-item-sheet.mjs";
import FoundryWrapper from "../../../common/foundry-wrapper.mjs";

export class GameSystemItemSheet extends ItemSheet {
  /**
   * Returns a map of `ItemSheet` sub-types and their factory functions. 
   * 
   * @type {Map<String, Function<TransientBaseActor>>}
   * @static
   * @readonly
   * @private
   */
    static get SUB_TYPES() {
      return new Map([
        [ITEM_TYPES.ASSET, new AssetItemSheet()],
        [ITEM_TYPES.SKILL, new SkillItemSheet()],
        [ITEM_TYPES.SCAR, new ScarItemSheet()],
        [ITEM_TYPES.MUTATION, new MutationItemSheet()],
        [ITEM_TYPES.INJURY, new InjuryItemSheet()],
        [ITEM_TYPES.ILLNESS, new IllnessItemSheet()],
        [ITEM_TYPES.FATE_CARD, new FateItemSheet()],
      ]);
    }

  /**
   * Type-dependent object which pseudo-extends the logic of this object. 
   * @type {GameSystemBaseItemSheet}
   * @readonly
   */
  get subType() {
    const type = this.item.type;
    const enhancer = GameSystemItemSheet.SUB_TYPES.get(type);
    
    if (enhancer === undefined) {
      throw new Error(`InvalidTypeException: Item sheet subtype ${type} is unrecognized!`);
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
   */
  static get defaultOptions() {
    return new FoundryWrapper().mergeObject(super.defaultOptions, {
      classes: [SYSTEM_ID, "sheet", "item"],
      width: 600,
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
   */
  get template() { return this.subType.template; }

  /**
   * Returns the localized title of this sheet. 
   * @override
   * @type {String}
   * @readonly
   */
  get title() { return this.subType.getTitle(this.item); }

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
   */
  getData() {
    const context = super.getData();
    SheetUtil.enrichData(context);

    // Prepare a new view model instance. 
    game.strive.logger.logPerf(this, "item.getData (getViewModel)", () => {
      this._viewModel = this.subType.getViewModel(context, context.item, this);
    });
    game.strive.logger.logPerf(this, "item.getData (readAllViewState)", () => {
      this._viewModel.readAllViewState();
    });
    context.viewModel = this._viewModel;
    
    return context;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    const isOwner = (this.actor ?? this.item).isOwner;
    
    await game.strive.logger.logPerfAsync(this, "item.activateListeners (subType)", async () => {
      await this.subType.activateListeners(html);
    });
    await game.strive.logger.logPerfAsync(this, "item.activateListeners (viewModel)", async () => {
      await this.viewModel.activateListeners(html);
    });

    if (!isOwner) return;

    // Drag events for macros.
    const handler = ev => this._onDragStart(ev);
    html.find('li.item').each((i, li) => {
      if (li.classList.contains("inventory-header")) return;
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
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
}
