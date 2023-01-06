import { TEMPLATES } from '../../templatePreloader.mjs';
import DialogButtonDefinition from '../dialog-button-definition.mjs';
import ModalDialog from '../modal-dialog/modal-dialog.mjs';

/**
 * Represents a plain dialog, whose content can be entirely determined by the user. 
 * 
 * This type of dialog should be used for purely informational content, with which 
 * the user cannot interact. 
 * 
 * @extends ModalDialog
 * 
 * @property {String | undefined} localizedContent The rendered HTML to display. 
 */
export default class PlainDialog extends ModalDialog {
  /** @override */
  get template() { return TEMPLATES.DIALOG_PLAIN; }

  /** @override */
  get id() { return "plain-dialog"; }

  /** @override */
  get buttons() { return [
    new DialogButtonDefinition({
      id: "dismiss",
      clickCallback: (html, dialog) => {
        dialog.close();
      },
      cssClass: "primary-button",
      iconCssClass: "fas fa-check",
      localizedLabel: game.i18n.localize("ambersteel.general.ok"),
    }),
  ]; }

  /** @override */
  get defaultButtonId() { return "dismiss"; }

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
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
