import { PropertyUtil } from "../../common/util/property-utility.mjs";
import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import { TEMPLATES } from "../application/templates.mjs";

/**
 * Utility for registering Handlebars global helpers. 
 */
export const HANDLEBARS_GLOBALS = {
  /**
   * @summary
   * Registers Handlebars helper functions, for use in Handlebars templates. 
   * 
   * @description
   * Registers the following Handlebars helper functions:
   * * `times(n, content)`
   * * `eq(a, b)`
   * * `neq(a, b)`
   * * `and(a, b)`
   * * `or(a, b)`
   * * `not(a)`
   * * `ifThenElse(condition, thenValue, elseValue)`
   */
  initHandlebarsHelpers: () => {
    Handlebars.registerHelper('times', HANDLEBARS_GLOBALS.times);
    Handlebars.registerHelper('eq', HANDLEBARS_GLOBALS.eq);
    Handlebars.registerHelper('neq', HANDLEBARS_GLOBALS.neq);
    Handlebars.registerHelper('and', HANDLEBARS_GLOBALS.and);
    Handlebars.registerHelper('or', HANDLEBARS_GLOBALS.or);
    Handlebars.registerHelper('not', HANDLEBARS_GLOBALS.not);
    Handlebars.registerHelper('ifThenElse', HANDLEBARS_GLOBALS.ifThenElse);
    Handlebars.registerHelper('themedImage', HANDLEBARS_GLOBALS.themedImage);
  },

  /**
   * Repeats the given `content` exactly `n` times. 
   * 
   * @param {Number} n The repetition count. 
   * @param {String} content The HTML content to repeat. 
   * 
   * @returns {String} The repeated content. 
   */
  times: (n, content) => {
    let result = "";
    for (let i = 0; i < n; i++) {
      result += content.fn(i);
    }

    return result;
  },

  /**
   * Returns `true`, if the given parameters are considered equal. Otherwise, returns `false`. 
   * 
   * @param {Any} a
   * @param {Any} b
   * 
   * @returns {Boolean}
   */
  eq: (a, b) => {
    return a == b;
  },

  /**
   * Returns `true`, if the given parameters are *not* considered equal. Otherwise, returns `false`. 
   * 
   * @param {Any} a
   * @param {Any} b
   * 
   * @returns {Boolean}
   */
  neq: (a, b) => {
    return a != b;
  },

  /**
   * Returns `true`, if both of the given parameters are 'truth-y' values. Otherwise, returns `false`. 
   * 
   * @param {Any} a
   * @param {Any} b
   * 
   * @returns {Boolean}
   */
  and: (a, b) => {
    return a && b;
  },

  /**
   * Returns `true`, if at least one of the given parameters is 'truth-y' values. Otherwise, returns `false`. 
   * 
   * @param {Any} a
   * @param {Any} b
   * 
   * @returns {Boolean}
   */
  or: (a, b) => {
    return a || b;
  },

  /**
   * Returns the given value, negated. 
   * 
   * @param {Any} a
   * 
   * @returns {Any | Boolean}
   */
  not: (a) => {
    return !a;
  },

  /**
   * If the given condition is satisfied, returns `thenValue`, otherwise, returns `elseValue`. 
   * 
   * @param {Any} condition
   * @param {Any} thenValue
   * @param {Any} elseValue
   * 
   * @returns {Any} `thenValue` or `elseValue`
   */
  ifThenElse: (condition, thenValue, elseValue) => {
    if (condition) {
      return thenValue;
    } else {
      return elseValue;
    }
  },

  /**
   * Returns two `img` elements which respect the dark and light mode theming. 
   * 
   * @param {String} templatePath A `TEMPLATES` relative template path. 
   * E. g. `"image.underline.h2"`
   * @param {String | undefined} cssClass
   * @param {String | undefined} style
   * @returns {String}
   */
  themedImage: (templatePath, cssClass, style) => {
    const root = PropertyUtil.getNestedPropertyValue(TEMPLATES, templatePath);
    const dark = root.dark ?? root;
    const light = root.light ?? root;
    const _cssClass = ValidationUtil.isDefined(cssClass) ? ` ${cssClass}` : "";

    return `<img src="${dark}" class="strive themed dark${_cssClass}" style="${style}"><img src="${light}" class="strive themed light${_cssClass}" style="${style}">`
  },
};
