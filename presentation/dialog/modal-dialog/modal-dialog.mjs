import { createUUID } from "../../../business/util/uuid-utility.mjs";
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
 * @summary
 * Represents the abstract base class for system-specific custom dialogs. 
 * 
 * @description
 * Handles setting up a "backdrop" which puts focus on the dialog and which allows 
 * for easy dialog dismissal. 
 * 
 * Inheriting types **must** override the properties `template`, `title` and `id`. 
 * 
 * Overriding `buttons` is recommendable in case action buttons are desired. 
 * 
 * @abstract
 * @extends Dialog
 * @see https://foundryvtt.com/api/classes/client.Application.html
 */
export default class ModalDialog extends Application {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      popOut: true,
      resizable: false,
      classes: ["ambersteel-modal"],
    });
  }

  /** @override */
  get template() { throw new Error("NotImplementedException"); }

  /** @override */
  get title() { throw new Error("NotImplementedException"); }

  /** @override */
  get id() { throw new Error("NotImplementedException"); }

  /**
   * Id of the back drop element. 
   * 
   * @type {String}
   * @private
   */
  backdropElementId;

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
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   */
  constructor(options = {}) {
    super(options);

    this.idBackdropElement = createUUID();
    this.easyDismissal = options.easyDismissal ?? true;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

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
  }

  /**
   * Ensures the backdrop element is present on the DOM. 
   * 
   * @private
   */
  _ensureModalBackdrop() {
    let element = $(`#${this.backdropElementId}`);

    if (element.length < 1) {
      element = $('body').append(`<div id="${this.backdropElementId}" class="${BACKDROP_ELEMENT_CLASS}"></div>`);
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
    $(`#${this.backdropElementId}`).remove();
  }
}

Handlebars.registerPartial('dialogModal', `{{#> "${TEMPLATES.DIALOG_MODAL}"}}{{> @partial-block }}{{/"${TEMPLATES.DIALOG_MODAL}"}}`);
