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
      baseSheet: `${basePathApplication}/item/base/sheet/base-item-sheet.hbs`,
      language: `${basePathApplication}/item/language/language-content.hbs`,
    },
    component: {
      textField: `${basePathComponent}/input-textfield/input-textfield.hbs`,
      numberSpinner: `${basePathComponent}/input-number-spinner/input-number-spinner.hbs`,
      dropDown: `${basePathComponent}/input-choice/input-dropdown/input-dropdown.hbs`,
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
