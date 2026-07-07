import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import { SheetUtil } from "../../../util/sheet-utility.mjs";
import { TEMPLATES } from "../../templates.mjs";
import CharacterActorSheetViewModel from "./character-actor-sheet-viewmodel.mjs";

/**
 * @property {viewModel} viewModel
 * @property {HTMLElement} html The form element of the sheet. 
 * * Read-only
 * @property {HTMLElement} content The content element of the sheet. 
 * * Read-only
 */
export class CharacterActorSheet extends FoundryWrapper.HandlebarsApplicationMixin(FoundryWrapper.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 650, height: 720, },
    classes: ["strive", "sheet", "actor"],
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
        { id: "gm" }
      ],
      initial: "abilities",
      labelPrefix: "SCENE.TABS.SHEET"
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: TEMPLATES.application.actor.character,
      abilities: {
        template: TEMPLATES.application.actor.abilities,
      }
    },
  }

  /**
   * @type {HTMLElement}
   * @private
   */
  #content = undefined
  /**
   * @type {HTMLElement}
   * @readonly
   */
  get content() { return this.#content; }

  /**
   * @type {HTMLElement}
   * @private
   */
  #html = undefined
  /**
   * @type {HTMLElement}
   * @readonly
   */
  get html() { return this.#html; }

  /**
   * The content container's current scroll value. 
   * 
   * @type {Number | undefined}
   */
  get scrollValue() {
    if (ValidationUtil.isDefined(this.contentElement) !== true) return undefined;
    return this.contentElement[0].scrollTop;
  }
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
  get title() { throw new Error("Not implemented"); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return ((this.actor ?? this.item) ?? {}).isOwner ?? false; }

  /**
   * @param {TransientCharacterDocument} document 
   * @returns {CharacterActorSheetViewModel}
   */
  createViewModel(document) {
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
  async close() {
    if (ValidationUtil.isDefined(this.viewModel)) {
      this.viewModel.writeViewState();
      this.viewModel.dispose();
    }
    return super.close();
  }

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

    // Ensure view model. 
    this.viewModel = this.createViewModel(context, context.item, this);
    this.viewModel.readAllViewState();
    context.viewModel = this.viewModel;

    return context;
  }

  /** @override */
  _getHeaderControls() {
    return super._getHeaderControls();
  }

  /** @override */
  async _postRender(context, options) {
    this.#html = context.viewModel.sheet.form;
    this.#content = $(this.html).find("section.window-content");

    await this.viewModel.activateListeners(this.#html);

    return await super._postRender(context, options);
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
}
