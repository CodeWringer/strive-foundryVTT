import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../foundry-interop/foundry-wrapper.mjs";

/**
 * String partial `"systems/strive"`. 
 * 
 * @type {String}
 * @constant
 */
const basePath = "systems/strive";

/**
 * String partial `"systems/strive/presentation"`. 
 * 
 * @type {String}
 * @constant
 */
const basePathPresentation = `${basePath}/presentation`;

/**
 * String partial `"systems/strive/presentation/application"`. 
 * 
 * @type {String}
 * @constant
 */
const basePathApplication = `${basePathPresentation}/application`;

/**
 * String partial `"systems/strive/presentation/application/component"`. 
 * 
 * @type {String}
 * @constant
 */
const basePathComponent = `${basePathApplication}/component`;

export const TEMPLATES = {
  application: {
    actor: {
    },
    item: {
      language: {
        sheet: `${basePathApplication}/item/language/language-item-sheet.hbs`,
        listItem: `${basePathApplication}/item/language/language-list-item.hbs`,
        chat: `${basePathApplication}/item/language/language-chat.hbs`,
      },
    },
    component: {
    },
  },
  /**
   * Returns the pre-loaded Handlebars templates, for fast access when rendering. 
   * 
   * @return {Promise<Any>}
   * 
   * @async
   * @private
   */
  _preloadHandlebarsTemplates: async () => {
    const _collectTemplatesInObj = (obj) => {
      let arr = [];
      for (const propertyName in obj) {
        if (!Object.hasOwn(obj, propertyName)) continue;
        const property = obj[propertyName];
        
        if (ValidationUtil.isObject(property)) {
          arr = arr.concat(_collectTemplatesInObj(property));
        } else if (ValidationUtil.isString(property)) {
          arr.push(property);
        }
      }
      return arr;
    };

    const templates = _collectTemplatesInObj(TEMPLATES.application);
    return await FoundryWrapper.loadTemplates(templates);
  },
}
