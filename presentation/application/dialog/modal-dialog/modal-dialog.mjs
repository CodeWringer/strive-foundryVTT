import { common } from "../../../../common/_module.mjs";
import DynamicComponent from "../../component/dynamic-component/dynamic-component.mjs";
import BaseDialog from "../base-dialog/base-dialog.mjs";

/**
 * Abstract base class for a modal dialog. 
 * 
 * @description
 * Handles setting up a "backdrop" which puts focus on the dialog and which allows 
 * for easy dialog dismissal. 
 * 
 * @extends BaseDialog
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
 * @property {Boolean} easyDismissal If `true`, allows for easier dialog 
 * dismissal, by clicking anywhere on the backdrop element. 
 * * Default `true`
 * @property {Array<DynamicComponent>} sections The sections that will 
 * be rendered as content of the dialog. 
 * @property {String | undefined} initialFocus
 * 
 * @method onClose Invoked upon the dialog closing. 
 * Receives this dialog instance as its only argument. 
 */
export default class ModalDialog extends BaseDialog {
  /**
   * Styling class of the back drop element. 
   * 
   * @type {String}
   * @readonly
   * @static
   */
  static get BACKDROP_ELEMENT_CLASS() { return "strive modal-backdrop"; }

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
   * Id of the back drop element. 
   * 
   * @type {String}
   * @private
   */
  _backdropElementId = undefined;

  /**
   * @param {Object} args 
   * @param {Function | undefined} args.onClose A function to invoke upon the 
   * closing of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} args.title Localized string for the dialog title. 
   * @param {Array<DynamicComponent> | undefined} args.sections The sections that will 
   * be rendered as content of the dialog. 
   * @param {String | undefined} args.initialFocus
   * 
   * @param {Boolean | undefined} args.easyDismissal If true, allows for easier dialog 
   * dismissal, by clicking anywhere on the backdrop element. 
   * * default `true`
   */
  constructor(args = {}) {
    super(args);

    this._backdropElementId = common.util.uuid.createUUID();
    this.easyDismissal = args.easyDismissal ?? true;
  }

  /** @override */
  close(options) {
    this._disposeModalBackdrop();
    super.close(options);
  }

  /** @override */
  async _postRender(context, options) {
    const o = await super._postRender(context, options);
    this._ensureModalBackdrop();
    return o;
  }

  /**
   * Ensures the backdrop element is present on the DOM. 
   * 
   * @private
   */
  _ensureModalBackdrop() {
    let element = $(`#${this._backdropElementId}`);

    if (element.length < 1) {
      const zIndex = $(this.html).attr("style").match(/z-index:\s*(\d+);/)[1];
      const backDropHtml = `<div id="${this._backdropElementId}" class="${ModalDialog.BACKDROP_ELEMENT_CLASS}" style="z-index: ${zIndex};"></div>`;
      $(backDropHtml).insertBefore(this.html);
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
    $(this.html).detach();
    $("body").append(this.html);
    $(`#${this._backdropElementId}`).remove();
  }
}
