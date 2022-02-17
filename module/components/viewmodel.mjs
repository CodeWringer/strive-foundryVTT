import { createUUID } from "../utils/uuid-utility.mjs";

/**
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 */
export default class ViewModel {
  static get TEMPLATE() { throw new Error("NotImplementedException"); }

  /**
   * @type {String}
   * @private
   */
  _id = undefined;
  /**
   * @type {String}
   * @readonly
   * @throws {Error} DisposedAccessViolation Thrown if the object has been disposed. 
   */
  get id() { return this._id; }

  /**
   * @type {Boolean}
   * @private
   */
  _isEditable = false;
  /**
   * @type {Boolean}
   * @readonly
   * @throws {Error} DisposedAccessViolation Thrown if the object has been disposed. 
   */
  get isEditable() { return this._isEditable; }

  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   */
  constructor(args = {}) {
    this._isEditable = args.isEditable ?? false;
    this._id = args.id ?? createUUID();
  }

  /**
   * Disposes of any working data. 
   * 
   * This is a clean-up operation that should only be called when the instance of this class is no longer needed!
   * @virtual
   */
  dispose() {
    const errorToThrowOnAccess = new Error("DisposedAccessViolation: The object has been disposed. Its members can no longer be accessed!");

    for (const propertyName in this) {
      // First call a potentially defined dispose method on the property to be disposed. 
      if (this.isObject(this[propertyName]) && this[propertyName].dispose !== undefined) {
        this[propertyName].dispose();
      }

      if (propertyName.startsWith("_") === true) {
        // Private variable values are set to null. 
        this[propertyName] = null;
      } else {
        // Accessors are all overriden to throw an error. 
        this[propertyName] = () => { throw errorToThrowOnAccess; };
      }
    }
  }

  /**
   * Returns true, if the given parameter is of type object. 
   * @param {Any} obj 
   * @returns {Boolean} True, if the given parameter is of type object. 
   * @private
   */
  isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };
}