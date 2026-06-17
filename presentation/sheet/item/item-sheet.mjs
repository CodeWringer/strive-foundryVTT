import { SYSTEM_ID } from "../../../system-id.mjs";
import { ITEM_TYPES } from "../../../business/document/item/item-types.mjs";
import AssetItemSheet from "./asset/asset-item-sheet.mjs";
import FateItemSheet from "./fate-card/fate-item-sheet.mjs";
import IllnessItemSheet from "./illness/illness-item-sheet.mjs";
import InjuryItemSheet from "./injury/injury-item-sheet.mjs";
import MomentumActionItemSheet from "./momentum-action/momentum-action-item-sheet.mjs";
import MutationItemSheet from "./mutation/mutation-item-sheet.mjs";
import ScarItemSheet from "./scar/scar-item-sheet.mjs";
import SkillItemSheet from "./skill/skill-item-sheet.mjs";
import FoundryWrapper from "../../../foundry-interop/foundry-wrapper.mjs";
import { SheetUtil } from "../sheet-utility.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import HealthConditionItemSheet from "./health-condition/health-condition-item-sheet.mjs";
import ItemSheetSubType from "./item-sheet-subtype.mjs";
import TraitItemSheet from "./trait/trait-item-sheet.mjs";
import ProjectItemSheet from "./project/project-item-sheet.mjs";

/**
 * Global definition of an Item sheet. This is what FoundryVTT instantiates to render 
 * an Item sheet. 
 * 
 * Unfortunately, FoundryVTT only allows registering a single ItemSheet class definition. 
 * This prevents OOP, as it is not possible to register specific ItemSheet derivatives 
 * for each Item document type. To circumvent this limitation and enable OOP after all, 
 * STRIVE introduces so-called sub-types. 
 * 
 * There is one sub-type for each Item document type. ALL of these sub-types MUST be 
 * registered in the static `SUB_TYPES` property! 
 * 
 * @extends ItemSheet
 * @see https://foundryvtt.com/api/v12/classes/client.ItemSheet.html
 * 
 * @property {ViewModel} viewModel
 */
export class GameSystemItemSheet extends ItemSheet {
  /**
   * Returns a map of `ItemSheet` sub-types and their factory functions. 
   * 
   * @type {Map<String, ItemSheetSubType>}
   * @static
   * @readonly
   * @private
   */
  static get SUB_TYPES() {
    return new Map([
      [ITEM_TYPES.ASSET, new AssetItemSheet()],
      [ITEM_TYPES.SKILL, new SkillItemSheet()],
      [ITEM_TYPES.SCAR, new ScarItemSheet()],
      [ITEM_TYPES.MOMENTUM_ACTION, new MomentumActionItemSheet()],
      [ITEM_TYPES.MUTATION, new MutationItemSheet()],
      [ITEM_TYPES.PROJECT, new ProjectItemSheet()],
      [ITEM_TYPES.INJURY, new InjuryItemSheet()],
      [ITEM_TYPES.ILLNESS, new IllnessItemSheet()],
      [ITEM_TYPES.FATE_CARD, new FateItemSheet()],
      [ITEM_TYPES.HEALTH_CONDITION, new HealthConditionItemSheet()],
      [ITEM_TYPES.TRAIT, new TraitItemSheet()],
    ]);
  }

  /**
   * Returns the sub-type. 
   * 
   * @type {ItemSheetSubType}
   * @readonly
   */
  get subType() {
    const type = this.item.type;
    const _subType = GameSystemItemSheet.SUB_TYPES.get(type);

    if (_subType === undefined) {
      throw new Error(`InvalidTypeException: Item sheet subtype ${type} is unrecognized!`);
    }

    return _subType;
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
   */
  static get defaultOptions() {
    return new FoundryWrapper().mergeObject(super.defaultOptions, {
      classes: [SYSTEM_ID, "sheet", "item"],
      width: 600,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "content" }]
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
  get title() { return this.subType.getTitle(this.item); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return ((this.actor ?? this.item) ?? {}).isOwner ?? false; }

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

    // Ensure view model. 
    this.viewModel = this.subType.getViewModel(context, context.item, this);
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
    // Item sheets do not currently support drag and drop operations from compendium packs or the world collection. 
  }

  /** @override */
  _getHeaderButtons() {
    const baseButtons = super._getHeaderButtons();
    return this.subType.getHeaderButtons(this).concat(baseButtons);
  }
}
