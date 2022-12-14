import DialogButtonDefinition from "../dialog-button-definition.mjs";
import ModalDialog from "../modal-dialog/modal-dialog.mjs";

/**
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

        if (dialog.closeOnConfirm === true) {
          dialog.close();
        }
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
   * If set to true, the dialog will automatically close itself, if the user clicks 
   * the confirm button. 
   * 
   * @type {Boolean}
   * @default true
   */
  closeOnConfirm = true;

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
   * 
   * @param {Function | undefined} options.closeOnConfirm If set to true, the dialog will 
   * automatically close itself, if the user clicks the confirm button. Default `true`. 
   */
  constructor(options = {}) {
    super(options);

    this.closeOnConfirm = options.closeOnConfirm ?? true;
  }
}
