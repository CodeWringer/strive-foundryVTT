import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import { TEMPLATES } from "../../templates.mjs";
import BaseDialogViewModel from "./base-dialog-viewmodel.mjs";

/**
 * Abstract base class for system-specific custom dialogs. 
 * 
 * @extends ApplicationV2
 * 
 * @abstract Inheritors _should_ override:
 * * To pass the template(s):
 * * * `constructor()` - Override the `sections` argument, to insert the dialog's 
 * actual html content. Override the `title` argument, to pass the dialog's title. 
 * * * Or, if you don't want the sub-viewmodels that requires, and just want to use 
 * your dialog's viewmodel, instead override `static PARTS`
 * * `get id` - give it a unique ID to identify the dialog *type*. Foundry already handles giving 
 * dialog *instances* unique IDs. 
 * * `createViewModel()` - And make it return the `ViewModel` you actually need for your dialog. 
 * 
 * @property {BaseDialogViewModel} viewModel
 * @property {Array<DynamicComponent>} sections The sections that will 
 * be rendered as content of the dialog. 
 * @property {String | undefined} initialFocus
 * 
 * @method onClose Invoked upon the dialog closing. 
 * Receives this dialog instance as its only argument. 
 */
export default class BaseDialog extends FoundryWrapper.HandlebarsApplicationMixin(FoundryWrapper.ApplicationV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 400, height: 300, },
    classes: ["strive", "dialog", "strive-regular-font"],
    tag: "form",
    window: {
      resizable: true,
      minimizable: false,
    },
  }

  /** @override */
  static PARTS = {
    form: {
      template: TEMPLATES.application.dialog.base,
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
  get title() { return this._title; }

  /** @override */
  get id() { return "dialog"; }

  /**
   * @param {Object} args 
   * @param {Function | undefined} args.onClose A function to invoke upon the 
   * closing of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} args.title Localized string for the dialog title. 
   * @param {Array<DynamicComponent> | undefined} args.sections The sections that will 
   * be rendered as content of the dialog. 
   * @param {String | undefined} args.initialFocus
   */
  constructor(args = {}) {
    super(args);

    this.onClose = args.onClose ?? (() => {});
    this._title = args.title ?? "";
    this.sections = args.sections ?? [];
    this.initialFocus = args.initialFocus;
  }

  /**
   * @param {TransientDocument} document 
   * @returns {BaseDialogViewModel}
   * 
   * @virtual
   */
  createViewModel() {
    return new BaseDialogViewModel({
      isEditable: true,
      sections: this.sections,
      initialFocus: this.initialFocus,
    });
  }

  /** @override */
  close(options) {
    super.close(options);

    if (ValidationUtil.isDefined(this.viewModel)) {
      this.viewModel.dispose();
    }
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
   * @returns {Promise<BaseDialog>} A promise that resolves when the dialog 
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
    this.#html = $(`#${context.viewModel.id}`).closest("form");
    this.#content = $(this.html).find(".window-content");
    
    await this.viewModel.activateListeners(this.#html);
    return await super._postRender(context, options);
  }
}
