import { ValidationUtil } from "./validation-utility.mjs";

/**
 * @constant
 */
export const StringUtil = {
  /**
   * The place holder character sequence. 
   * 
   * @type {String}
   * @constant
   */
  FORMAT_PLACEHOLDER: "%s",

  /**
   * Pattern for detection of a float. 
   * 
   * @type {String}
   * @constant
   */
  REGEX_FLOAT: /-?\d+\.\d+/,

  /**
   * Pattern for detection of an integer. 
   * 
   * @type {String}
   * @constant
   */
  REGEX_INT: /-?\d+/,

  /**
   * Pattern for detection of a placeholder. 
   * 
   * @type {String}
   * @constant
   */
  REGEX_PLACEHOLDER: /%\{(?<placeholder>[^}]+)\}/g,

  /**
   * Every property corresponds to an HTML special character and its value 
   * represents its escape sequence. 
   * 
   * @type {Object}
   * @private
   */
  _htmlSpecialCharactersEscapeMap: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  },

  /**
   * Pattern for detection of an HTML special character. 
   * 
   * @type {String}
   * @constant
   */
  REGEX_HTML_ESCAPE: /([<>"'`=\/]|&(?!([a-zA-Z]{1,8}\d{0,2}|#(\d{1,4}|x[a-zA-Z\d]{1,4}));))/g,

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
  format: function (str) {
    let newString = str;

    for (let i = 1; i < arguments.length; i++) {
      const argument = arguments[i];
      const placeHolderIndex = newString.indexOf(this.FORMAT_PLACEHOLDER);

      if (placeHolderIndex < 0) {
        break;
      }

      newString = newString.substring(0, placeHolderIndex) + argument + newString.substring(placeHolderIndex + this.FORMAT_PLACEHOLDER.length);
    }

    return newString;
  },

  /**
   * Returns a new String, based on the given string, with any placeholders 
   * replaced with the other given arguments, in the order that they appear. 
   * 
   * Any `%{<placeholder>}` sequence is replaced. 
   * 
   * @example
   * ```JS
   * format2("Hello, %{firstName}!", { firstName: "Bob" }); // Returns "Hello, Bob!"
   * format2("Hello, %{name1}! Goodbye, %{name2}!", { name1: "Bob", name2: "Bobette" }); // Returns "Hello, Bob! Goodbye, Bobette!"
   * ```
   * 
   * @param {String} str A string that contains placeholders. All placeholders must 
   * follow the format `%{<placeholder>}`. E. g. `"%{myPlaceholder}"`
   * @param {Object} replacements An object that must contain properties whose names match 
   * the exact placeholder names in the given string. Their value is the replacement. 
   * E. g. `{ firstName: "Bob", lastName: "Bauer" }`
   * 
   * @returns {String} A formatted string
   */
  format2: function (str, replacements) {
    let newString = str;

    const matches = str.matchAll(new RegExp(StringUtil.REGEX_PLACEHOLDER));

    for (const match of matches) {
      newString = newString.replaceAll(match[0], replacements[match.groups.placeholder]);
    }

    return newString;
  },

  /**
   * Returns a parsed/coerced value, based on the given string value. 
   * 
   * @param {String} value A string value to parse/coerce. 
   * 
   * @returns {Boolean | Number | String}
   */
  coerce: function (value) {
    const matchFloat = value.match(this.REGEX_FLOAT);
    const matchInt = value.match(this.REGEX_INT);

    if (value === "true" || value === "false") {
      return value === "true";
    } else if (matchFloat !== null && matchFloat[0].length === value.length) {
      return parseFloat(value);
    } else if (matchInt !== null && matchInt[0].length === value.length) {
      return parseInt(value);
    } else {
      return value;
    }
  },

  /**
   * Escapes all HTML special characters contained in the given string 
   * and then returns a new string with these replacements. 
   * 
   * @param {String} string A string containing symbols to be HTML escaped. 
   * 
   * @returns {String} The new string with escape replacements. 
   */
  escapeHtml(string) {
    const thiz = this;
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
      return thiz._htmlSpecialCharactersEscapeMap[s];
    });
  },

  /**
   * Returns the localized string identified by the given key. 
   * @param {String} key Localization key.
   * @returns {String} Localized string.
   */
  getLoca(key) {
    return game.i18n.localize(key);
  },

  /**
   * Returns `true`, if the given string is matched by the given pattern. 
   * @param {String} str The string to test.
   * @param {String} regex A regex pattern.
   * @returns {Boolean} `true`, if the string is matched by the pattern. 
   */
  matches(str, regex) {
    const m = str.match(regex);
    return m !== undefined && m !== null;
  },

  /**
   * Returns the index of the matching closing character. 
   * @param {String} str String to search in.
   * E. g. `"(a (b))"`
   * @param {Number} char Indicates the type of matchable character. 
   * See `StringUtil.MATCHABLE_CHARS`. 
   * @param {Number} index Index to start searching from.
   * @returns {Number} Index of the closing character, or `-1`, if it 
   * couldn't find it. 
   */
  findClosing(str, char, index) {
    if (ValidationUtil.isBlankOrUndefined(str)) {
      throw new Error("`str` must not be blank or null");
    }
    if (!ValidationUtil.isDefined(char)) {
      throw new Error("`char` must not undefined or null");
    }
    if (!ValidationUtil.isDefined(index)) {
      throw new Error("`index` must not undefined or null");
    }

    let open = 0;
    for (let i = index; i < str.length; i++) {
      const c = str[i];
      
      if (char === StringUtil.MATCHABLE_CHARS.ANGLE_BRACKETS) {
        if (c === "<") {
          open++;
        } else if (c === ">") {
          open--;
        }
      } else if (char === StringUtil.MATCHABLE_CHARS.BRACKETS) {
        if (c === "[") {
          open++;
        } else if (c === "]") {
          open--;
        }
      } else if (char === StringUtil.MATCHABLE_CHARS.CURLY_BRACES) {
        if (c === "{") {
          open++;
        } else if (c === "}") {
          open--;
        }
      } else if (char === StringUtil.MATCHABLE_CHARS.PARENTHESES) {
        if (c === "(") {
          open++;
        } else if (c === ")") {
          open--;
        }
      }

      if (open === 0) {
        return i;
      }
    }
    return -1;
  },

  /**
   * Returns the index of the matching opening character. 
   * @param {String} str String to search in.
   * E. g. `"(a (b))"`
   * @param {Number} char Indicates the type of matchable character. 
   * See `StringUtil.MATCHABLE_CHARS`. 
   * @param {Number} index Index to start searching from.
   * @returns {Number} Index of the opening character, or `-1`, if it 
   * couldn't find it. 
   */
  findOpening(str, char, index) {
    if (ValidationUtil.isBlankOrUndefined(str)) {
      throw new Error("`str` must not be blank or null");
    }
    if (!ValidationUtil.isDefined(char)) {
      throw new Error("`char` must not undefined or null");
    }
    if (!ValidationUtil.isDefined(index)) {
      throw new Error("`index` must not undefined or null");
    }

    let open = 0;
    for (let i = index; i >= 0; i--) {
      const c = str[i];
      
      if (char === StringUtil.MATCHABLE_CHARS.ANGLE_BRACKETS) {
        if (c === ">") {
          open++;
        } else if (c === "<") {
          open--;
        }
      } else if (char === StringUtil.MATCHABLE_CHARS.BRACKETS) {
        if (c === "]") {
          open++;
        } else if (c === "[") {
          open--;
        }
      } else if (char === StringUtil.MATCHABLE_CHARS.CURLY_BRACES) {
        if (c === "}") {
          open++;
        } else if (c === "{") {
          open--;
        }
      } else if (char === StringUtil.MATCHABLE_CHARS.PARENTHESES) {
        if (c === ")") {
          open++;
        } else if (c === "(") {
          open--;
        }
      }

      if (open === 0) {
        return i;
      }
    }
    return -1;
  },

  MATCHABLE_CHARS: {
    /**
     * "<" and ">"
     */
    ANGLE_BRACKETS: 0,
    /**
     * "[" and "]"
     */
    BRACKETS: 1,
    /**
     * "{" and "}"
     */
    CURLY_BRACES: 2,
    /**
     * "(" and ")"
     */
    PARENTHESES: 3,
  },
};
