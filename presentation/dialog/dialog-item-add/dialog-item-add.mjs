import GetShowFancyFontUseCase from '../../../business/use-case/get-show-fancy-font-use-case.mjs';
import { getItemDeclarations } from '../../../business/util/content-utility.mjs';
import { validateOrThrow } from '../../../business/util/validation-utility.mjs';
import { getElementValue } from '../../sheet/sheet-utility.mjs';
import { TEMPLATES } from '../../template/templatePreloader.mjs';
import ConfirmableModalDialog from '../confirmable-modal-dialog/confirmable-modal-dialog.mjs';

const LOCALIZABLE_TITLE = "ambersteel.general.select";

/**
 * @summary
 * Represents a dialog for the selection of an item to add to an actor. 
 * 
 * @extends ConfirmableModalDialog
 */
export default class AddItemDialog extends ConfirmableModalDialog {
  /** @override */
  get template() { return TEMPLATES.DIALOG_ITEM_ADD; }

  /** @override */
  get title() { return this.localizedTitle; }

  /** @override */
  get id() { return "dialog-add-item"; }

  /**
   * Returns the current value of the selection drop-down element. 
   * 
   * @readonly
   * @type {String}
   */
  get selected() { return getElementValue(this._html.find(".ambersteel-item-select")[0]); }

  /**
   * Returns the current value of the "is custom" checkbox element. 
   * 
   * @readonly
   * @type {Boolean}
   */
  get isCustomChecked() { return getElementValue(this._html.find(".ambersteel-is-custom")[0]); }

  /**
   * @param {Object} options 
   * @param {Boolean | undefined} options.easyDismissal If true, allows for easier dialog dismissal, 
   * by clicking anywhere on the backdrop element. Default `true`. 
   * @param {Function | undefined} options.closeCallback A function to invoke upon the closing 
   * of the dialog. Receives this dialog instance as its only argument. 
   * 
   * @param {String} options.itemType Item type. 
   * * E. g. "skill" or "injury"
   * @param {String | undefined} options.localizedItemLabel Localized string for the item input label. 
   * @param {String | undefined} options.localizedTitle Localized string for the dialog title. 
   */
  constructor(options = {}) {
    super(options);

    validateOrThrow(options, ["itemType"]);

    this.itemType = options.itemType;
    this.localizedItemLabel = options.localizedItemLabel ?? options.itemType;
    this.localizedTitle = options.localizedTitle ?? game.i18n.localize(LOCALIZABLE_TITLE);

    this._itemDeclarations = getItemDeclarations(this.itemType);
    this._showFancyFont = new GetShowFancyFontUseCase().invoke();
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".ambersteel-is-custom").change(event => {
      const select = html.find(".ambersteel-item-select")[0];
      if (getElementValue(event.currentTarget) === true) {
        select.className = select.className + " ambersteel-read-only";
      } else {
        select.className = select.className.replace(" ambersteel-read-only", "");
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
