import ConfirmableModalDialog from '../confirmable-modal-dialog/confirmable-modal-dialog.mjs';

/**
 * Represents a plain dialog, whose content can be entirely determined by the user. 
 * 
 * This type of dialog should be used for purely informational content, with which 
 * the user cannot interact. 
 * 
 * @extends ConfirmableModalDialog
 * 
 * @property {String | undefined} localizedContent The rendered HTML to display. 
 */
export default class ConfirmablePlainDialog extends ConfirmableModalDialog {
  /** @override */
  get template() { return game.strive.const.TEMPLATES.DIALOG_PLAIN_CONFIRMABLE; }

  /** @override */
  get id() { return "confirmable-plain-dialog"; }

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
   * 
   * @param {String | undefined} options.localizedContent The rendered HTML to display. 
   */
  constructor(options = {}) {
    super(options);

    this.localizedContent = options.localizedContent;
  }

  /** @override */
  getData(options) {
    return {
      ...super.getData(options),
      localizedContent: this.localizedContent,
    }
  }
}
