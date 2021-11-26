import * as DialogUtil from '../utils/dialog-utility.mjs';
import { TEMPLATES } from '../templatePreloader.mjs';
import { getItemDeclarationsFrom } from '../utils/content-utility.mjs';
import { getElementValue } from '../utils/sheet-utility.mjs';

/**
 * @returns {Promise<Object>} = {
 * selected: {String} Id of the selected item,
 * isCustomChecked: {Boolean},
 * confirmed: {Boolean}
 * }
 * @async
 */
export async function showDialog() {
  const skills = getItemDeclarationsFrom("skill");

  return new Promise(async (resolve, reject) => {
    const dialogResult = await DialogUtil.showDialog(
      {
        dialogTemplate: TEMPLATES.DIALOG_SKILL_ADD,
        localizableTitle: "ambersteel.dialog.titleSkillAddQuery"
      },
      {
        skills: skills
      }
    );
    resolve({
      selected: getElementValue(dialogResult.html.find(".ambersteel-skill-select")[0]),
      isCustomChecked: getElementValue(dialogResult.html.find(".ambersteel-is-custom")[0]),
      confirmed: dialogResult.confirmed
    });
  });
}

/**
 * @returns {Promise<Object>} = {
 * selected: {String} Id of the selected item,
 * isCustomChecked: {Boolean},
 * confirmed: {Boolean}
 * }
 * @async
 */
export async function query() {
  return new Promise(async (resolve, reject) => {
    if (keyboard.isDown("Shift")) {
      resolve({
        selected: undefined,
        isCustomChecked: true,
        confirmed: true
      });
    } else {
      resolve(await showDialog());
    }
  });
}
