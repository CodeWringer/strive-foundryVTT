import { StringUtil } from "../../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../../foundry-interop/foundry-wrapper.mjs";
import { TEMPLATES } from "../../../templates.mjs";
import BaseItemSheetViewModel from "./base-item-sheet-viewmodel.mjs";

/**
 * Abstract base Item sheet class. 
 * 
 * @abstract Inheritors MUST override:
 * * `static TABS`
 * * `static PARTS`
 * * `get localizedDocumentType`

 * Inheritors _should_ override:
 * * `createViewModel()`
 * 
 * Inheritors _may_ override:
 * * `_getTabsConfig()`
 * * `get title`
 * 
 * @property {BaseItemSheetViewModel} viewModel
 * @property {HTMLElement} html The form element of the sheet. 
 * * Read-only
 * @property {HTMLElement} content The content element of the sheet. 
 * * Read-only
 * @property {String} title
 * * Read-only
 * @property {String} localizedDocumentType
 * * Read-only
 */
export class BaseItemSheet extends FoundryWrapper.HandlebarsApplicationMixin(FoundryWrapper.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 500, height: 520, },
    classes: ["strive", "sheet", "item", "strive-regular-font"],
    tag: "form",
    window: {
      resizable: true,
    },
    actions: {
      sendToChat: {
        buttons: [0],
        handler: (event, element) => {
          const id = $(element).parent().parent().attr("id")
          const viewModel = game.strive.viewModels.get(id);
          viewModel.sendToChat();
        },
      },
      enterEditMode: {
        buttons: [0],
        handler: (event, element) => {
          const id = $(element).parent().parent().attr("id")
          const viewModel = game.strive.viewModels.get(id);
          viewModel.enterEditMode();
        },
      },
      saveEdits: {
        buttons: [0],
        handler: (event, element) => {
          const id = $(element).parent().parent().attr("id")
          const viewModel = game.strive.viewModels.get(id);
          viewModel.saveEdits();
        },
      },
    },
  }

  /** @override */
  static PARTS = {
    form: {
      template: TEMPLATES.application.item.baseSheet,
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

  /** @override */
  get title() {
    let loca = this.localizedDocumentType;
    if ((this.viewModel ?? {}).isEditable) {
      loca = StringUtil.format(
        StringUtil.getLoca("system.general.edit.editingSheet"),
        loca,
      );
    }
    return loca.toUpperCase();
  }

  /**
   * @type {String}
   * @override
   * @readonly
   * @abstract
   */
  get localizedDocumentType() { throw new Error("Not implemented"); }

  /**
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return ((this.actor ?? this.item) ?? {}).isOwner ?? false; }

  /**
   * @param {TransientDocument} document 
   * @returns {BaseItemSheetViewModel}
   * 
   * @virtual
   */
  createViewModel(document) {
    return new BaseItemSheetViewModel({
      id: document.id,
      document: document,
    });
  }

  /** @override */
  async close() {
    if (ValidationUtil.isDefined(this.viewModel)) {
      this.viewModel.writeViewState();
      this.viewModel.dispose();
      this.viewModel = null;
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
    this.viewModel = this.createViewModel(context.document);
    this.viewModel.readAllViewState();
    context.viewModel = this.viewModel;

    return context;
  }

  /** @override */
  _getFrameButtons() {
    const controls = super._getFrameButtons();
    return [
      {
        action: "sendToChat",
        icon: "ico ico-speech-bubble",
        label: "system.general.sendToChat",
      },
      {
        action: "enterEditMode",
        icon: "ico ico-edit",
        label: "system.general.edit.enterEditMode",
      },
      {
        action: "saveEdits",
        icon: "ico ico-floppy",
        label: "system.general.edit.saveEdits",
      },
    ].concat(controls);
  }

  /** @override */
  async _postRender(context, options) {
    this.#html = context.viewModel.sheet.form;
    this.#content = $(this.html).find("section.window-content");

    await this.viewModel.activateListeners(this.#html);

    return await super._postRender(context, options);
  }
}
