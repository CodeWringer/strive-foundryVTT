import { common } from "../../../../common/_module.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import { TEMPLATES } from "../../templates.mjs";
import ModalDialogViewModel from "./modal-dialog-viewmodel.mjs";

/**
 * @summary
 * Represents the abstract base class for system-specific custom dialogs. 
 * 
 * @description
 * Handles setting up a "backdrop" which puts focus on the dialog and which allows 
 * for easy dialog dismissal. 
 * 
 * @extends ApplicationV2
 * 
 * @abstract Inheritors _should_ override:
 * * `get id`
 * 
 * @property {ModalDialogViewModel} viewModel
 * @property {Boolean} easyDismissal If `true`, allows for easier dialog 
 * dismissal, by clicking anywhere on the backdrop element. 
 * * Default `true`
 * @property {Array<DynamicComponent>} sections The sections that will 
 * be rendered as content of the dialog. 
 * 
 * @method onClose Invoked upon the dialog closing. 
 * Receives this dialog instance as its only argument. 
 */
export default class ModalDialog extends FoundryWrapper.HandlebarsApplicationMixin(FoundryWrapper.ApplicationV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 400, height: 300, },
    classes: ["strive", ModalDialog.DIALOG_ELEMENT_CLASS, "strive-regular-font"],
    tag: "form",
    window: {
      resizable: true,
      minimizable: false,
    },
  }

  /** @override */
  static PARTS = {
    form: {
      template: TEMPLATES.application.dialog.modal,
    },
  }

  /**
   * Styling class of the back drop element. 
   * 
   * @type {String}
   * @readonly
   * @static
   */
  static get BACKDROP_ELEMENT_CLASS() { return "strive modal-backdrop"; }

  /**
   * Styling class of the dialog element. 
   * 
   * @type {String}
   * @readonly
   * @static
   */
  static get DIALOG_ELEMENT_CLASS() { return "strive modal"; }

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
  get title() { return this._title; }

  /** @override */
  get id() { return "modal-dialog"; }

  /**
   * If true, allows for easier dialog dismissal, by clicking anywhere on the backdrop element. 
   * 
   * @type {Boolean}
   * @default true
   */
  easyDismissal = true;

  /**
   * A function to invoke upon the closing of the dialog. 
   * 
   * Receives this dialog instance as its only argument. 
   * 
   * @type {Function | undefined}
   */
  onClose = undefined;

  /**
   * Id of the back drop element. 
   * 
   * @type {String}
   * @private
   */
  _backdropElementId = undefined;

  /**
   * @param {Object} args 
   * @param {Boolean | undefined} args.easyDismissal If true, allows for easier dialog 
   * dismissal, by clicking anywhere on the backdrop element. 
   * * default `true`
   * @param {Function | undefined} args.onClose A function to invoke upon the 
   * closing of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} args.title Localized string for the dialog title. 
   * @param {Array<DynamicComponent> | undefined} args.sections The sections that will 
   * be rendered as content of the dialog. 
   */
  constructor(args = {}) {
    super(args);

    this._backdropElementId = common.util.uuid.createUUID();

    this.easyDismissal = args.easyDismissal ?? true;
    this.onClose = args.onClose ?? (() => {});
    this._title = args.title ?? "";
    this.sections = args.sections ?? [];
  }

  /**
   * @param {TransientDocument} document 
   * @returns {ModalDialogViewModel}
   * 
   * @abstract
   */
  createViewModel() {
    return new ModalDialogViewModel({
      isEditable: true,
      sections: this.sections,
    });
  }

  /** @override */
  close(options) {
    super.close(options);

    this._disposeModalBackdrop();
    this.onClose(this);

    if (this._renderAndAwait === true) {
      this._resolve(this);
    }
  }

  /**
   * Renders this dialog and returns a promise that resolves when the dialog 
   * is closed. The dialog itself is the promise's payload. 
   * 
   * @param {Boolean} force Optional. 
   * * Default `true`. 
   * 
   * @returns {Promise<ModalDialog>} A promise that resolves when the dialog 
   * is closed. The dialog itself is the promise's payload. 
   * 
   * @async
   */
  async renderAndAwait(force = true) {
    this._renderAndAwait = true;
    this.render(force);

    return new Promise((resolve, reject) => {
      this._resolve = resolve;
    });
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
    this.viewModel = this.createViewModel();
    this.viewModel.readAllViewState();
    context.viewModel = this.viewModel;

    return context;
  }

  /** @override */
  async _postRender(context, options) {
    console.log("A");
    this.#html = $(`section#${context.viewModel.id}`).closest("form");
    this.#content = $(this.html).find("section.window-content");
    
    this._ensureModalBackdrop();
    
    await this.viewModel.activateListeners(this.#html);
    return await super._postRender(context, options);
  }

  /**
   * Ensures the backdrop element is present on the DOM. 
   * 
   * @private
   */
  _ensureModalBackdrop() {
    let element = $(`#${this._backdropElementId}`);

    if (element.length < 1) {
      const zIndex = $(this.#html).attr("style").match(/z-index:\s*(\d+);/)[1];
      const backDropHtml = `<div id="${this._backdropElementId}" class="${ModalDialog.BACKDROP_ELEMENT_CLASS}" style="z-index: ${zIndex};"></div>`;
      $(backDropHtml).insertBefore(this.#html);
      element = $(`div#${this._backdropElementId}`);

      if (this.easyDismissal === true) {
        element.click(() => {
          this.close();
        });
      }
    }
  }

  /**
   * Removes the back drop element. 
   * 
   * @private
   */
  _disposeModalBackdrop() {
    $(this.#html).detach();
    $("body").append(this.#html);
    $(`#${this._backdropElementId}`).remove();
  }
}
