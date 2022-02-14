import { createUUID } from "../utils/uuid-utility.mjs";

/**
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} template Static. Returns the template this ViewModel is intended for. 
 */
export default class ViewModel {
  static get template() { throw new Error("NotImplementedException") }

  /**
   * @type {String}
   * @private
   */
  _id = undefined;
  /**
   * @type {String}
   * @readonly
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
   */
  get isEditable() { return this._isEditable; }

  /**
   * @param {Boolean | undefined} args.isEditable 
   * @param {String | undefined} args.id
   */
  constructor(args = {}) {
    args = {
      isEditable: false,
      id: createUUID(),
      ...args,
    }
    this._isEditable = args.isEditable;
    this._id = args.id;
  }
}