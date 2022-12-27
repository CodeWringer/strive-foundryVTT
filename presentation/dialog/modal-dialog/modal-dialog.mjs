import { createUUID } from "../../../business/util/uuid-utility.mjs";
import { isFunction } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";

/**
 * Styling class of the back drop element. 
 * 
 * @type {String}
 * @constant
 * @private
 */
const BACKDROP_ELEMENT_CLASS = "ambersteel-modal-backdrop";

/**
 * Styling class of the dialog element. 
 * 
 * @type {String}
 * @constant
 * @private
 */
const DIALOG_ELEMENT_CLASS = "ambersteel-modal";

/**
 * @summary
 * Represents the abstract base class for system-specific custom dialogs. 
 * 
 * @description
 * Handles setting up a "backdrop" which puts focus on the dialog and which allows 
 * for easy dialog dismissal. 
 * 
 * Inheriting types **must** override `template`. Overriding `id` is recommended. 
 * 
 * Overriding `buttons` is recommendable in case action buttons are desired. 
 * 
 * @abstract
 * @extends Application
 * @see https://foundryvtt.com/api/classes/client.Application.html
 * 
 * @property {Array<DialogButtonDefinition>} buttons Returns a list of button definitions for use in this dialog. 
 * * Read-only
 * @property {String | undefined} defaultButtonId Returns the id of the button to focus by default. 
 * * Read-only
 * @property {Boolean} easyDismissal If true, allows for easier dialog dismissal, by clicking anywhere on the backdrop element. 
 * * Default `true`
 * @property {Function | undefined} closeCallback A function to invoke upon the closing of the dialog. 
 * Receives this dialog instance as its only argument. 
 */
export default class ModalDialog extends Application {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      popOut: true,
      resizable: false,
      classes: [DIALOG_ELEMENT_CLASS, "width-min-xl", "height-min-sm"],
      minimizable: false,
    });
  }

  /** @override */
  get template() { throw new Error("NotImplementedException"); }

  /**
   * The localized dialog title. 
   * 
   * @type {String}
   * @private
   */
  _localizedTitle = "";
  /** @override */
  get title() { return this._localizedTitle; }

  /** @override */
  get id() { return "modal-dialog"; }

  /**
   * Returns a list of button definitions for use in this dialog. 
   * 
   * @type {Array<DialogButtonDefinition>}
   * @readonly
   * @virtual
   */
  get buttons() { return []; }

  /**
   * Returns the id of the button to focus by default. 
   * 
   * @type {String | undefined}
   * @readonly
   * @virtual
   */
  get defaultButtonId() { return undefined; }

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
  closeCallback = undefined;

  /**
   * Id of the back drop element. 
   * 
   * @type {String}
   * @private
   */
  _backdropElementId = undefined;

  /**
   * The DOM of the dialog. 
   * 
   * Only available **after** `activateListeners` is called! 
   * 
   * @type {JQuery}
   * @protected
   */
  _html = undefined;

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
   */
  constructor(options = {}) {
    super(options);

    this._backdropElementId = createUUID();

    this.easyDismissal = options.easyDismissal ?? true;
    this.closeCallback = options.closeCallback;
    this._localizedTitle = options.localizedTitle ?? "";
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._html = html;

    const thiz = this;

    // Attach button click handlers. 
    for (const button of this.buttons) {
      if (button.clickCallback === undefined) continue;

      const buttonElement = html.find(`#${button.id}`);
      buttonElement.click(() => {
        button.clickCallback(html, thiz);
      });
    }

    // Try to focus one of the buttons by default. 
    if (this.defaultButtonId !== undefined) {
      html.find(`#${this.defaultButtonId}`).focus();
    }

    this._ensureModalBackdrop();
  }

  /** @override */
  close(options) {
    super.close(options);

    this._removeModalBackdrop();
    if (isFunction(this.closeCallback)) {
      this.closeCallback(this);
    }

    if (this._renderAndAwait === true) {
      this._resolve(this);
    }
  }
  
  /** @override */
  getData(options) {
    return {
      ...super.getData(options),
      buttons: this.buttons,
    }
  }

  /**
   * Renders this dialog and returns a promise that resolves when the dialog 
   * is closed. The dialog itself is the promise's payload. 
   * 
   * @param {Boolean} force Optional. 
   * * Default `true`. 
   * 
   * @returns {Promise} A promise that resolves when the dialog 
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
   * Ensures the backdrop element is present on the DOM. 
   * 
   * @private
   */
  _ensureModalBackdrop() {
    let element = $(`#${this._backdropElementId}`);

    if (element.length < 1) {
      $('body').append(`<div id="${this._backdropElementId}" class="${BACKDROP_ELEMENT_CLASS}"></div>`);
      element = $(`#${this._backdropElementId}`);
    }

    if (this.easyDismissal === true) {
      const thiz = this;

      element.click(function (e) {
        thiz.close();
      });
    }
  }

  /**
   * Removes the back drop element. 
   * 
   * @private
   */
  _removeModalBackdrop() {
    $(`#${this._backdropElementId}`).remove();
  }
}

Handlebars.registerPartial('dialogContent', `{{#> "${TEMPLATES.DIALOG_MODAL}"}}{{> @partial-block }}{{/"${TEMPLATES.DIALOG_MODAL}"}}`);
