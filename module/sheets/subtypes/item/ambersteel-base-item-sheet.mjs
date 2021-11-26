import * as SheetUtil from '../../../utils/sheet-utility.mjs';
import * as ButtonAdd from '../../../components/button-add.mjs';
import * as ButtonRoll from '../../../components/button-roll.mjs';
import * as ButtonDelete from '../../../components/button-delete.mjs';
import * as ButtonSendToChat from '../../../components/button-send-to-chat.mjs';
import * as InputComponent from '../../../components/input.mjs';
import { TEMPLATES } from "../../../templatePreloader.mjs";

export default class AmbersteelBaseItemSheet {
  /**
   * The owning ItemSheet object. 
   * @type {ItemSheet}
   */
  parent = undefined;

  /**
   * @param parent {ItemSheet} The owning ItemSheet. 
   */
  constructor(parent) {
    if (!parent || parent === undefined) {
      throw "Argument 'owner' must not be null or undefined!"
    }
    this.parent = parent;
    this.parent.getActor = this.getActor.bind(this);
    this.parent.getItem = this.getItem.bind(this);
    this.parent.getContextEntity = this.getContextEntity.bind(this);
  }

  /**
   * Returns the template path. 
   * @returns {String} Path to the template. 
   * @virtual
   */
  get template() { 
    return TEMPLATES.ITEM_SHEET; 
  }

  /**
   * @returns {Actor}
   */
  getActor() {
    return this.getItem().parent;
  }

  /**
   * Returns the item object of the parent sheet. 
   * @returns {Item} The item object of the parent sheet. 
   */
  getItem() {
    return this.parent.item;
  }

  /**
   * Returns the current context object. 
   * @returns {Actor|Item} The current context object. 
   */
  getContextEntity() {
    return this.getItem();
  }

  /**
   * Extends the given context object with derived data. 
   * 
   * This is where any data should be added, which is only required to 
   * display the data via the parent sheet. 
   * @param context {Object} A context data object. Some noteworthy properties are 
   * 'item', 'CONFIG', 'isSendable' and 'isEditable'. 
   * @virtual
   */
  prepareDerivedData(context) {
  }

  /**
   * Registers events on elements of the given DOM. 
   * @param html {Object} DOM of the sheet for which to register listeners. 
   * @param isOwner {Boolean} If true, registers events that require owner permission. 
   * @param isEditable {Boolean} If true, registers events that require editing permission. 
   * @virtual
   */
  activateListeners(html, isOwner, isEditable) {
    ButtonAdd.activateListeners(html, this, isOwner, isEditable);
    ButtonRoll.activateListeners(html, this, isOwner, isEditable);
    ButtonDelete.activateListeners(html, this, isOwner, isEditable);
    ButtonSendToChat.activateListeners(html, this, isOwner, isEditable);
    InputComponent.activateListeners(html, this, isOwner, isEditable);
    
    // -------------------------------------------------------------
    if (!isOwner) return;

    // -------------------------------------------------------------
    if (!isEditable) return;
  }
}