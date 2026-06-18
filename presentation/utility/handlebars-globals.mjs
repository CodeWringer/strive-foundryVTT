import { TEMPLATES } from "../templates.mjs";

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
    Handlebars.registerHelper('times', times);
    Handlebars.registerHelper('eq', eq);
    Handlebars.registerHelper('neq', neq);
    Handlebars.registerHelper('and', and);
    Handlebars.registerHelper('or', or);
    Handlebars.registerHelper('not', not);
    Handlebars.registerHelper('ifThenElse', ifThenElse);
  },

  /**
   * @summary
   * Registers Handlebars helper partials, for use in Handlebars templates. 
   * 
   * @description
   * Registers the following Handlebars helper partials:
   * * `label` - accepts child content.
   * * `header1` - accepts child content.
   * * `header2` - accepts child content.
   * * `header3` - accepts child content.
   * * `hintCard` - accepts child content.
   * * `hDivider` - accepts **no** child content.
   */
  initHandlebarsPartials: () => {
    Handlebars.registerPartial('verticalLine', `{{#> "${TEMPLATES.COMPONENT_VERTICAL_LINE}"}}{{/"${TEMPLATES.COMPONENT_VERTICAL_LINE}"}}`);
    Handlebars.registerPartial('label', `{{#> "${TEMPLATES.COMPONENT_LABEL}"}}{{> @partial-block}}{{/"${TEMPLATES.COMPONENT_LABEL}"}}`);
    Handlebars.registerPartial('header1', `{{#> "${TEMPLATES.COMPONENT_HEADER_PRIMARY}"}}{{> @partial-block}}{{/"${TEMPLATES.COMPONENT_HEADER_PRIMARY}"}}`);
    Handlebars.registerPartial('header2', `{{#> "${TEMPLATES.COMPONENT_HEADER_SECONDARY}"}}{{> @partial-block}}{{/"${TEMPLATES.COMPONENT_HEADER_SECONDARY}"}}`);
    Handlebars.registerPartial('header3', `{{#> "${TEMPLATES.COMPONENT_HEADER_TERTIARY}"}}{{> @partial-block}}{{/"${TEMPLATES.COMPONENT_HEADER_TERTIARY}"}}`);
    Handlebars.registerPartial('hintCard', `{{#> "${TEMPLATES.COMPONENT_HINT_CARD}"}}{{> @partial-block}}{{/"${TEMPLATES.COMPONENT_HINT_CARD}"}}`);
    Handlebars.registerPartial('hDivider', `{{> "${TEMPLATES.COMPONENT_HORIZONTAL_DIVIDER}"}}`);
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
};
