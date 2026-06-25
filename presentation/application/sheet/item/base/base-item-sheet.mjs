import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";

/**
 * Abstract base Item sheet class. 
 * 
 * @abstract Inheritors MUST override:
 * * `static TABS`
 * * `static PARTS`
 * 
 * Inheritors MAY override:
 * * `_getTabsConfig()`
 * 
 * @property {viewModel} viewModel
 */
export class BaseItemSheet extends FoundryWrapper.HandlebarsApplicationMixin(FoundryWrapper.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 420, height: 520, },
    classes: ["strive", "sheet", "item"],
    tag: "form",
    window: { 
      resizable: true, 
    },
  }

  /** @override */
  static TABS = {
    sheet: {
      tabs: ["gmNotes"],
      initial: "gmNotes",
    },
  }

  /** @override */
  static PARTS = {
    form: {
      template: undefined, // TODO #739
      gmNotes: {
        template: undefined, // TODO #739
      }
    },
  }

  /** @override */
  _getTabsConfig(group) {
    const tabConfig = FoundryWrapper.deepClone(super._getTabsConfig());
    tabConfig.tabs.push ({ 
      id: "gmNotes",
      group: "sheet",
      label: "GM", // TODO #739 loca
    });
    return tabConfig;
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
