import DialogButtonDefinition from "../dialog-button-definition.mjs";
import ModalDialog from "../modal-dialog/modal-dialog.mjs";

/**
 * @summary
 * Represents the abstract base class for system-specific custom dialogs, 
 * which provide a confirm and cancel button. 
 * 
 * @abstract
 * @extends ModalDialog
 */
export default class ConfirmableModalDialog extends ModalDialog {
  /** @override */
  get buttons() { return [
    new DialogButtonDefinition({
      id: "confirm",
      clickCallback: (html, dialog) => {
        dialog.confirmed = true;
        dialog.close();
      },
      cssClass: "primary-button",
      iconCssClass: "fas fa-check",
      localizedLabel: game.i18n.localize("ambersteel.general.confirm"),
    }),
    new DialogButtonDefinition({
      id: "cancel",
      clickCallback: (html, dialog) => {
        dialog.close();
      },
      cssClass: "secondary-button",
      iconCssClass: "fas fa-times",
      localizedLabel: game.i18n.localize("ambersteel.general.cancel"),
    }),
  ]; }

  /** @override */
  get defaultButtonId() { return "cancel"; }

  /**
   * Returns true, if the dialog was closed via the confirmation button. 
   * 
   * @type {Boolean}
   * @default false
   * @readonly
   */
  confirmed = false;

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   */
  constructor(options = {}) {
    super(options);
  }
}

Handlebars.registerPartial('confirmableModalDialog', `{{#> modalDialog}}{{> @partial-block }}{{/modalDialog}}`);
