/**
 * Represents key codes as jQuery knows them. These can be queried via jQuery's event object's 
 * `which` property. 
 * 
 * @example
 * ```JS
 * $("body").on("keydown", (event) => {
 *   if (event.which === KEY_CODES.ALT) {
 *     // Do something
 *   }
 * })
 * ```
 * 
 * @constant
 */
export const KEY_CODES = {
  ALT: 18,
}
