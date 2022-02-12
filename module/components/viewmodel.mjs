import { createUUID } from "../utils/uuid-utility.mjs";

/**
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {Boolean} isSendable If true, the object can be sent to chat. 
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
   * @type {Boolean}
   * @private
   */
  _isSendable = false;
  /**
   * @type {Boolean}
   * @readonly
   */
  get isSendable() { return this._isSendable; }

  constructor(args = {}) {
    args = {
      isEditable: false,
      isSendable: false,
      id: createUUID(),
      ...args,
    }
    this._isEditable = args.isEditable;
    this._isSendable = args.isSendable;
    this._id = args.id;
  }
}