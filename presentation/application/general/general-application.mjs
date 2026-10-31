import { StringUtil } from "../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../foundry-interop/foundry-wrapper.mjs";

/**
 * Represents a general-purpose Application that can house arbitrary content. 
 * 
 * @abstract Inheritors MUST override:
 * * `static PARTS`
 * * `get localizedDocumentType`
 * * `createViewModel()`
 * 
 * Inheritors _should_ override:
 * * `_getViewModelConstructorArgs()`
 * 
 * Inheritors may override:
 * * `static DEFAULT_OPTIONS`
 * 
 * @extends FoundryWrapper.ApplicationV2
 */
export default class GeneralApplication extends FoundryWrapper.HandlebarsApplicationMixin(FoundryWrapper.ApplicationV2) {
/** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 600, height: 520, },
    classes: ["strive", "sheet", "item", "strive-regular-font"],
    tag: "form",
    window: {
      resizable: true,
    },
  }

  /** @override */
  static PARTS = {
    // form: {
    //   template: TEMPLATES.application.item.base.sheet,
    // },
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
   * Returns the localized document sub-type. 
   * @type {String}
   * @override
   * @readonly
   * @abstract
   */
  get localizedDocumentType() {
    throw new Error("Not implemented");
  }

  constructor() {
    super();
  }

  /**
   * @param {Object} args 
   * @returns {ViewModel}
   * @abstract
   */
  createViewModel(args) {
    throw new Error("Not implemented");
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
   * Returns the arguments to pass in to `createViewModel`. 
   * @returns {Object}
   * @virtual
   * @protected
   */
  _getViewModelConstructorArgs() {
    return {};
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)

    // Ensure view model. 
    this.viewModel = this.createViewModel(this._getViewModelConstructorArgs());
    this.viewModel.readAllViewState();
    context.viewModel = this.viewModel;

    return context;
  }

  /** @override */
  async _postRender(context, options) {
    this.#html = context.viewModel.sheet.form; // TODO #762 verify
    this.#content = $(this.html).find("section.window-content");

    await this.viewModel.activateListeners(this.#html);

    return await super._postRender(context, options);
  }
}
