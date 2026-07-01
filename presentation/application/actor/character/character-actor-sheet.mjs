import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import { SheetUtil } from "../../../util/sheet-utility.mjs";
import CharacterActorSheetViewModel from "./character-actor-sheet-viewmodel.mjs";

/**
 * @property {viewModel} viewModel
 */
export class CharacterActorSheet extends FoundryWrapper.HandlebarsApplicationMixin(FoundryWrapper.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 650, height: 720, },
    classes: ["strive", "sheet", "item"],
    tag: "form",
    window: {
      resizable: true,
    },
  }

  /** @override */
  static TABS = {
    sheet: {
      tabs: [
        { id: "abilities" },
        { id: "personality" },
        { id: "health" },
        { id: "assets" },
        { id: "projects" },
        { id: "gm"  }
      ],
      initial: "abilities",
      labelPrefix: "SCENE.TABS.SHEET"
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: undefined,
      gmNotes: {
        template: TEMPLATES.COMPONENT_GM_NOTES,
      }
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
   * @param {BaseItemSheet} sheet 
   * @returns {BaseSheetViewModel}
   * @protected
   */
  getViewModel(document, sheet) {
    return new CharacterActorSheetViewModel({
      id: this.id,
      document: document,
      sheet: sheet,
      isOwner: this.isOwner,
      isEditable: this.isOwner,
      isSendable: this.isOwner,
    });
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
