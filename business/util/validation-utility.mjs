/**
 * @constant
 */
export const ValidationUtil = {
  /**
   * Returns true, if the given object has properties with the given names and 
   * whose value is not null and not undefined. 
   * 
   * @param {Object} obj The object whose properties will be validated. 
   * @param {Array<String>} props An array of properties whose value must not be null or undefined. 
   * 
   * @returns {Boolean} True, if the expected properties are not null or undefined. 
   */
  propertiesDefined: function(obj, props) {
    for (const prop of props) {
      if (this.isDefined(obj[prop]) !== true) {
        return false;
      }
    }
    return true;
  },
  
  /**
   * Returns true, if the given value is neither `undefined`, nor `null`. 
   * 
   * @param {Any | undefined | null} obj 
   * 
   * @returns {Boolean} True, if the given value is neither `undefined`, nor `null`. 
   */
  isDefined: function(obj) {
    return obj !== undefined && obj !== null;
  },
  
  /**
   * Throws an error, if the given object has properties with the given names and 
   * whose value is null or undefined. 
   * 
   * @param {Object} obj The object whose properties will be validated. 
   * @param {Array<String>} props An array of properties whose value must not be null or undefined. 
   * 
   * @throws {Error} ArgumentException - Thrown, if any of the properties fail to validate. 
   */
  validateOrThrow: function(obj, props) {
    for (const prop of props) {
      if (obj[prop] == undefined
        || obj[prop] == null) throw new Error(`ArgumentException: Required parameter '${prop}' is undefined!`);
    }
  },
  
  /**
   * Returns true, if the given argument is of type object. 
   * 
   * @param {Any} obj 
   * 
   * @returns {Boolean} True, if the given argument is of type object. 
   */
  isObject: function(obj) {
    return (Object.prototype.toString.call(obj) === '[object Object]' || typeof(obj) === 'object') && obj !== null
    && this.isArray(obj) !== true
    && this.isFunction(obj) !== true;
  },
  
  /**
   * Returns true, if the given argument is of type array. 
   * 
   * @param {Any} obj 
   * 
   * @returns {Boolean} True, if the given argument is of type array. 
   */
  isArray: function(obj) {
    if (obj !== undefined && obj !== null && ((obj.isArray !== undefined && obj.isArray(obj)) || Array.isArray(obj))) {
      return true;
    } else {
      return false;
    }
  },
  
  /**
   * Returns true, if the given argument is of type function. 
   * 
   * @param {Any} obj 
   * 
   * @returns {Boolean} True, if the given argument is of type function. 
   */
  isFunction: function(obj) {
    return typeof(obj) === 'function';
  },
  
  /**
   * Returns true, if the given argument is of type number. 
   * 
   * @param {Any} o 
   * 
   * @returns {Boolean} True, if the given argument is of type number. 
   */
  isNumber: function(o) {
    const isStringNumber = ("" + o).match(/^\d+(\.\d+)?$/);
    return isStringNumber !== null ? true : Number.isFinite(o);
  },
  
  /**
   * Returns true, if the given argument is of type string. 
   * 
   * @param {Any} o 
   * 
   * @returns {Boolean} True, if the given argument is of type string. 
   */
  isString: function(o) {
    return typeof(o) === "string";
  },
  
  /**
   * Returns true, if the given value is blank or undefined. 
   * 
   * @param {String | Number} value 
   * 
   * @returns {Boolean}
   */
  isBlankOrUndefined: function(value) {
    if (value === undefined || value === null)
      return true;
  
    if (value.trim === undefined)
      return false;
  
    const trimmed = value.trim() !== undefined ? value.trim() : value;
    return trimmed === "" || trimmed.length <= 0;
  },
  
  /**
   * Returns true, if the given value is **not** blank or undefined. 
   * 
   * @param {String | Number} value 
   * 
   * @returns {Boolean}
   */
  isNotBlankOrUndefined: function(value) {
    return this.isBlankOrUndefined(value) === false;
  },
  
  /**
   * Returns `true`, if the given object is iterable. 
   * 
   * @param {Any} o The object to test.
   * 
   * @returns {Boolean} `true`, if the given object is iterable.
   */
  isIterable: function(o) {
    return Symbol.iterator in Object(o);
  },
}
