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
      base: {
        sheet: `${basePathApplication}/item/base/sheet/base-item-sheet.hbs`,
        header: `${basePathApplication}/item/base/base-item-header.hbs`,
        content: `${basePathApplication}/item/base/base-item-content.hbs`,
      },
      asset: {
        header: `${basePathApplication}/item/asset/asset-header.hbs`,
        content: `${basePathApplication}/item/asset/asset-content.hbs`,
      },
      healthCondition: {
        header: `${basePathApplication}/item/health-condition/health-condition-header.hbs`,
        content: `${basePathApplication}/item/health-condition/health-condition-content.hbs`,
      },
      language: {
        header: `${basePathApplication}/item/language/language-header.hbs`,
        content: `${basePathApplication}/item/language/language-content.hbs`,
      },
      injury: {
        header: `${basePathApplication}/item/injury/injury-header.hbs`,
        content: `${basePathApplication}/item/injury/injury-content.hbs`,
      },
      illness: {
        header: `${basePathApplication}/item/illness/illness-header.hbs`,
        content: `${basePathApplication}/item/illness/illness-content.hbs`,
      },
      mutation: {
        header: `${basePathApplication}/item/mutation/mutation-header.hbs`,
        content: `${basePathApplication}/item/mutation/mutation-content.hbs`,
      },
      project: {
        header: `${basePathApplication}/item/project/project-header.hbs`,
        content: `${basePathApplication}/item/project/project-content.hbs`,
      },
      recipe: {
        header: `${basePathApplication}/item/recipe/recipe-header.hbs`,
        content: `${basePathApplication}/item/recipe/recipe-content.hbs`,
      },
      skill: {
        header: `${basePathApplication}/item/skill/skill-header.hbs`,
        content: `${basePathApplication}/item/skill/skill-content.hbs`,
      },
      trait: {
        header: `${basePathApplication}/item/trait/trait-header.hbs`,
        content: `${basePathApplication}/item/trait/trait-content.hbs`,
      },
    },
    dialog: {
      base: `${basePathApplication}/dialog/base-dialog/base-dialog.hbs`,
      uiDebug: `${basePathApplication}/dialog/ui-debug-dialog/ui-debug-dialog.hbs`,
    },
    component: {
      abilityLevel: `${basePathComponent}/ability-level/ability-level.hbs`,
      button: `${basePathComponent}/button/button.hbs`,
      buttonDropDown: `${basePathComponent}/button-dropdown/button-dropdown.hbs`,
      textField: `${basePathComponent}/input-textfield/input-textfield.hbs`,
      numberSpinner: `${basePathComponent}/input-number-spinner/input-number-spinner.hbs`,
      splitNumberSpinner: `${basePathComponent}/input-split-number-spinner/input-split-number-spinner.hbs`,
      dropDown: `${basePathComponent}/input-choice/input-dropdown/input-dropdown.hbs`,
      richText: {
        main: `${basePathComponent}/input-rich-text/input-rich-text.hbs`,
        lazy: `${basePathComponent}/input-rich-text/input-rich-text-lazy-content.hbs`,
      },
      reference: `${basePathComponent}/input-reference/input-reference.hbs`,
      row: `${basePathComponent}/row/row.hbs`,
      image: `${basePathComponent}/input-image/input-image.hbs`,
      complication: {
        complication: `${basePathComponent}/complication/complication.hbs`,
        list: `${basePathComponent}/complication/complication-list.hbs`,
      },
    },
  },
  image: {
    diamondBg: {
      dark: `${basePathPresentation}/image/diamond-bg-dark.svg`,
      light: `${basePathPresentation}/image/diamond-bg-light.svg`,
    },
    underline: {
      h1: {
        left: {
          dark: `${basePathPresentation}/image/h1-left-dark.svg`,
          light: `${basePathPresentation}/image/h1-left-light.svg`,
        },
        center: {
          dark: `${basePathPresentation}/image/h1-center-dark.svg`,
          light: `${basePathPresentation}/image/h1-center-light.svg`,
        },
        right: {
          dark: `${basePathPresentation}/image/h1-right-dark.svg`,
          light: `${basePathPresentation}/image/h1-right-light.svg`,
        }
      },
      h2: {
        dark: `${basePathPresentation}/image/underline-h2-325x7-dark.svg`,
        light: `${basePathPresentation}/image/underline-h2-325x7-light.svg`,
      },
      h2Secondary: {
        dark: `${basePathPresentation}/image/underline-h2-325x7-dark-secondary.svg`,
        light: `${basePathPresentation}/image/underline-h2-325x7-light-secondary.svg`,
      },
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
