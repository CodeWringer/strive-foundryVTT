import { createUUID } from "../../module/utils/uuid-utility.mjs";

/**
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {Boolean} isSendable If true, the object can be sent to chat. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} template Static. Returns the template this ViewModel is intended for. 
 */
export default class ViewModel {
  static get template() { game.ambersteel.logError("Not implemented!"); }

  constructor(args = {
    isEditable: false,
    isSendable: false,
    id = createUUID()
  }) {
    this.isEditable = args.isEditable;
    this.isSendable = args.isSendable;
    this.id = args.id;
  }
}