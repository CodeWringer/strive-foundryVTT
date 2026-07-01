import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../../foundry-interop/foundry-wrapper.mjs";
import { SheetUtil } from "../../../../util/sheet-utility.mjs";
import { TEMPLATES } from "../../../templates.mjs";
import BaseSheetViewModel from "../../../view-model/base-sheet-viewmodel.mjs";

/**
 * Abstract base Item sheet class. 
 * 
 * @abstract Inheritors MUST override:
 * * `static TABS`
 * * `static PARTS`
 * * `getViewModel()`
 * * `get title`
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
  static PARTS = {
    form: {
      template: TEMPLATES.application.item.language.sheet,
    },
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
  get title() { return "UNDEFINED"; }

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
  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    SheetUtil.enrichData(context);

    // Ensure view model. 
    this.viewModel = this.getViewModel(context, context.item, this);
    this.viewModel.readAllViewState();
    context.viewModel = this.viewModel;

    return context;
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
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

  /**
   * @param {TransientDocument} document 
   * @returns {BaseSheetViewModel}
   * 
   * @abstract
   */
  getViewModel(document) {
    throw new Error("Not implemented");
  }

  /** @override */
  _getTabsConfig(group) {
    let tabConfig = super._getTabsConfig();
    tabConfig = FoundryWrapper.deepClone(tabConfig);
    tabConfig.tabs.push({
      id: "gmNotes",
      group: "sheet",
      label: "GM", // TODO #739 loca
    });
    return tabConfig;
  }

  /** @override */
  _getHeaderButtons() {
    return super._getHeaderButtons();
  }
}
