import GetShowFancyFontUseCase from '../../../business/use-case/get-show-fancy-font-use-case.mjs';
import { getItemDeclarations } from '../../../business/util/content-utility.mjs';
import { validateOrThrow } from '../../../business/util/validation-utility.mjs';
import { getElementValue } from '../../sheet/sheet-utility.mjs';
import { TEMPLATES } from '../../template/templatePreloader.mjs';
import ConfirmableModalDialog from '../confirmable-modal-dialog/confirmable-modal-dialog.mjs';
import * as DialogUtil from '../dialog-utility.mjs';

const LOCALIZABLE_TITLE = "ambersteel.character.asset.add.query";
const LOCALIZABLE_ITEM_LABEL = "ambersteel.character.asset.add.label";

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
  get title() { return game.i18n.localize(localizableTitle); }

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
  get isCustomChecked() { return getElementValue(dialogResult.html.find(".ambersteel-is-custom")[0]); }

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
    this.localizableItemLabel = options.localizedItemLabel ?? LOCALIZABLE_ITEM_LABEL;
    this.localizableTitle = options.localizedTitle ?? LOCALIZABLE_TITLE;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    const thiz = this;
    const itemDeclarations = getItemDeclarations(this.itemType);
    html.find(".ambersteel-is-custom").change(event => {
      const select = html.find(".ambersteel-item-select")[0];
      if (getElementValue(event.currentTarget) === true) {
        select.className = select.className + " ambersteel-read-only";
      } else {
        select.className = select.className.replace(" ambersteel-read-only", "");
      }
    });
  }
}

window.AddItemDialog = AddItemDialog;

/**
 * @param {String} itemType Item type. E. g. "skill" or "injury"
 * @param {String | undefined} localizableItemLabel Localization string for the item input label. 
 * @param {String | undefined} localizableTitle Localization string for the dialog title. 
 * @returns {Promise<Object>} = {
 * selected: {String} Id of the selected item,
 * isCustomChecked: {Boolean},
 * confirmed: {Boolean}
 * }
 * @async
 */
export async function showDialog(itemType, localizableItemLabel = LOCALIZABLE_ITEM_LABEL, localizableTitle = LOCALIZABLE_TITLE) {
  const itemDeclarations = getItemDeclarations(itemType);

  return new Promise(async (resolve, reject) => {
    const dialogResult = await DialogUtil.showDialog(
      {
        dialogTemplate: TEMPLATES.DIALOG_ITEM_ADD,
        localizedTitle: game.i18n.localize(localizableTitle),
        render: html => {
          html.find(".ambersteel-is-custom").change(event => {
            const select = html.find(".ambersteel-item-select")[0];
            if (getElementValue(event.currentTarget) === true) {
              select.className = select.className + " ambersteel-read-only";
            } else {
              select.className = select.className.replace(" ambersteel-read-only", "");
            }
          });
        }
      },
      {
        itemLabel: game.i18n.localize(localizableItemLabel),
        itemDeclarations: itemDeclarations,
        showFancyFont: new GetShowFancyFontUseCase().invoke(),
      }
    );
    resolve({
      selected: getElementValue(dialogResult.html.find(".ambersteel-item-select")[0]),
      isCustomChecked: getElementValue(dialogResult.html.find(".ambersteel-is-custom")[0]),
      confirmed: dialogResult.confirmed
    });
  });
}

/**
 * @param {String} itemType Item type. "skill"|"injury"|"illness"|"item"
 * @param {String | undefined} localizableItemLabel Localization string for the item input label. 
 * @param {String | undefined} localizableTitle Localization string for the dialog title. 
 * @returns {Promise<Object>} = {
 * selected: {String} Id of the selected item,
 * isCustomChecked: {Boolean},
 * confirmed: {Boolean}
 * }
 * @async
 */
export async function query(itemType, localizableItemLabel = LOCALIZABLE_ITEM_LABEL, localizableTitle = LOCALIZABLE_TITLE) {
  return new Promise(async (resolve, reject) => {
    if (game.keyboard.downKeys.has("SHIFT")) {
      resolve({
        selected: undefined,
        isCustomChecked: true,
        confirmed: true
      });
    } else {
      resolve(await showDialog(itemType, localizableItemLabel, localizableTitle));
    }
  });
}
