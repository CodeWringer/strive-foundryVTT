/**
 * The place holder character sequence. 
 * 
 * @type {String}
 * @constant
 */
export const FORMAT_PLACEHOLDER = "%s";

/**
 * Pattern for detection of a float. 
 * 
 * @type {String}
 * @constant
 */
const REGEX_FLOAT = /-?\d+\.\d+/;

/**
 * Pattern for detection of an integer. 
 * 
 * @type {String}
 * @constant
 */
const REGEX_INT = /-?\d+/;

/**
 * Returns a new String, based on the given string, with any placeholders 
 * replaced with the other given arguments, in the order that they appear. 
 * 
 * Any '%s' is replaced. This character sequence can be escaped with '\%s', 
 * which prints '%s', omitting the backslash. 
 * 
 * @example
 * ```JS
 * format("Hello, %s!", "Bob"); // Returns "Hello, Bob!"
 * format("Hello, %s! Goodbye, %s!", "Bob", "Bobette"); // Returns "Hello, Bob! Goodbye, Bobette!"
 * ```
 * 
 * @param {String} str A string that contains formatting placeholders '%s'. 
 * @returns {String} A formatted string
 */
export function format(str) {
  let newString = str;

  for (let i = 1; i < arguments.length; i++) {
    const argument = arguments[i];
    const placeHolderIndex = newString.indexOf(FORMAT_PLACEHOLDER);

    if (placeHolderIndex < 0) {
      break;
    }

    newString = newString.substring(0, placeHolderIndex) + argument + newString.substring(placeHolderIndex + FORMAT_PLACEHOLDER.length);
  }

  return newString;
}

/**
 * Returns a parsed/coerced value, based on the given string value. 
 * 
 * @param {String} value A string value to parse/coerce. 
 * 
 * @returns {Boolean | Number | String}
 */
export function coerce(value) {
  const matchFloat = value.match(REGEX_FLOAT);
  const matchInt = value.match(REGEX_INT);

  if (value === "true" || value === "false") {
    return value === "true";
  } else if (matchFloat !== null && matchFloat[0].length === value.length) {
    return parseFloat(value);
  } else if (matchInt !== null && matchInt[0].length === value.length) {
    return parseInt(value);
  } else {
    return value;
  }
}