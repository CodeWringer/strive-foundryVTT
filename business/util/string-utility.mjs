/**
 * The place holder character sequence. 
 * @type {String}
 * @constant
 */
export const FORMAT_PLACEHOLDER = "%s";

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