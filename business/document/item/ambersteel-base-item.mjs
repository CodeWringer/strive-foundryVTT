import { TEMPLATES } from "../../../presentation/template/templatePreloader.mjs";

/**
 * Represents the base contract for a "specific" item "sub-type". 
 * 
 * Such a "sub-type" is really on an "enhancer", which adds properties and/or methods to a given `Item` instance. 
 */
export default class AmbersteelBaseItem {
  /**
   * Returns the default icon image path for this type of item. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return "icons/svg/item-bag.svg"; }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return TEMPLATES.ITEM_CHAT_MESSAGE; }

  /**
   * Prepare data for the item. 
   * 
   * **IMPORTANT**: Any changes to the item made **will be persisted** to the 
   * data base! Therefore, **only** use this method to ensure sensible 
   * default values are set. Under no circumstance should derivable data 
   * be added here! 
   * 
   * @param {Item} context An item instance. 
   * 
   * @virtual
   */
  prepareData(context) { /** Actual implementation left to inheriting types. */}
}