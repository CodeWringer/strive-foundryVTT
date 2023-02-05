import DocumentFetcher from '../../../business/document/document-fetcher/document-fetcher.mjs';
import GetShowFancyFontUseCase from '../../../business/use-case/get-show-fancy-font-use-case.mjs';
import { validateOrThrow } from '../../../business/util/validation-utility.mjs';
import { getElementValue } from '../../sheet/sheet-utility.mjs';
import { TEMPLATES } from '../../templatePreloader.mjs';
import ConfirmableModalDialog from '../confirmable-modal-dialog/confirmable-modal-dialog.mjs';

/**
 * The localization key of the dialog title. 
 * 
 * @type {String}
 * @constant
 * @private
 */
const DIALOG_TITLE = "ambersteel.general.select";

/**
 * The CSS class of a read-only element. 
 * 
 * @type {String}
 * @constant
 * @private
 */
const READ_ONLY_CSS_CLASS = "ambersteel-read-only";

/**
 * The CSS selector of the drop-down element. 
 * 
 * @type {String}
 * @readonly
 * @private
 */
const SELECTOR_ITEM_SELECT = ".ambersteel-item-select";

/**
 * The CSS selector of the "is custom" checkbox element. 
 * 
 * @type {String}
 * @readonly
 * @private
 */
const SELECTOR_IS_CUSTOM = ".ambersteel-is-custom";

/**
 * Represents a dialog for the selection of an item to add to an actor. 
 * 
 * @extends ConfirmableModalDialog
 */
export default class AddItemDialog extends ConfirmableModalDialog {
  /** @override */
  get template() { return TEMPLATES.DIALOG_ITEM_ADD; }

  /** @override */
  get id() { return "dialog-add-item"; }

  /**
   * Returns the current value of the selection drop-down element. 
   * 
   * @readonly
   * @type {String}
   */
  get selected() { return getElementValue(this._html.find(SELECTOR_ITEM_SELECT)[0]); }

  /**
   * Returns the current value of the "is custom" checkbox element. 
   * 
   * @readonly
   * @type {Boolean}
   */
  get isCustomChecked() { return getElementValue(this._html.find(SELECTOR_IS_CUSTOM)[0]); }

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
   * @param {String} options.itemType Item type. 
   * * E. g. "skill" or "injury"
   * @param {String | undefined} options.localizedItemLabel Localized string for the item input label. 
   */
  constructor(options = {}) {
    super({...options,
      localizedTitle: options.localizedTitle ?? game.i18n.localize(DIALOG_TITLE),
    });

    validateOrThrow(options, ["itemType"]);

    this.itemType = options.itemType;
    this.localizedItemLabel = options.localizedItemLabel ?? options.itemType;

    this._itemDeclarations = new DocumentFetcher().getIndices({
      documentType: "Item",
      contentType: this.itemType,
    });
    this._showFancyFont = new GetShowFancyFontUseCase().invoke();
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    html.find(SELECTOR_IS_CUSTOM).change(event => {
      const select = html.find(SELECTOR_ITEM_SELECT)[0];
      if (getElementValue(event.currentTarget) === true) {
        $(select).addClass(READ_ONLY_CSS_CLASS);
      } else {
        $(select).removeClass(READ_ONLY_CSS_CLASS);
      }
    });
  }

  /** @override */
  getData(options) {
    return {
      ...super.getData(options),
      itemLabel: this.localizedItemLabel,
      itemDeclarations: this._itemDeclarations,
      showFancyFont: this._showFancyFont,
    }
  }
}
