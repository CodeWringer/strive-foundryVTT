import GetShowFancyFontUseCase from '../../../business/use-case/get-show-fancy-font-use-case.mjs';
import { getItemDeclarations } from '../../../business/util/content-utility.mjs';
import { getElementValue } from '../../sheet/sheet-utility.mjs';
import { TEMPLATES } from '../../template/templatePreloader.mjs';
import * as DialogUtil from '../dialog-utility.mjs';

const LOCALIZABLE_TITLE = "ambersteel.character.asset.add.query";
const LOCALIZABLE_ITEM_LABEL = "ambersteel.character.asset.add.label";

/**
 * @param {String} itemType Item type. E. g. "skill" or "injury"
 * @param {String} localizableItemLabel Localization string for the item input label. 
 * @param {String} localizableTitle Localization string for the dialog title. 
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
