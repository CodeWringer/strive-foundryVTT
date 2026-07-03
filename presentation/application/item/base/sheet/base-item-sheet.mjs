import { StringUtil } from "../../../../../common/util/string-utility.mjs";
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
 * * `get localizedDocumentType`
 * 
 * Inheritors MAY override:
 * * `_getTabsConfig()`
 * * `get title`
 * 
 * @property {ViewModel} viewModel
 * @property {HTMLElement} html The form element of the sheet. 
 * * Read-only
 * @property {HTMLElement} content The content element of the sheet. 
 * * Read-only
 * @property {String} title
 * * Read-only
 * @property {String} localizedDocumentType
 * * Read-only
 * @property {Boolean} isEditMode
 */
export class BaseItemSheet extends FoundryWrapper.HandlebarsApplicationMixin(FoundryWrapper.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 500, height: 520, },
    classes: ["strive", "sheet", "item"],
    tag: "form",
    window: {
      resizable: true,
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

  /** @override */
  get title() {
    let loca = this.localizedDocumentType;
    if (this.isEditMode) {
      loca = StringUtil.format(
        StringUtil.getLoca("system.general.editingSheet"), 
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

  constructor(document) {
    super(document);
    this.isEditMode = false;
  }

  /**
   * @param {TransientDocument} document 
   * @returns {BaseSheetViewModel}
   * 
   * @abstract
   */
  createViewModel(document) {
    throw new Error("Not implemented");
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
    SheetUtil.enrichData(context);

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
}
