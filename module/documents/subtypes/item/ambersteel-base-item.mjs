import { TEMPLATES } from '../../../templatePreloader.mjs';

/**
 * This represents the base type for all item sub-types to inherit from. 
 * 
 * The contract expected by a concrete `Item` instance is defined herein. 
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
   * @summary
   * Prepare base data for the item. 
   * 
   * @description
   * The data added here should be non-derivable data, meaning it should only prepare 
   * the data object to ensure certain properties exist and aren't undefined. 
   * 
   * This should also set primitive data, even if it is technically derived, shouldn't be any 
   * data set based on extensive calculations. Setting the 'img'-property's path, based on the object 
   * type should be the most complex a 'calculation' as it gets. 
   * 
   * Base data *is* persisted!
   * @param {Item} context
   * @virtual
   */
  prepareData(context) {}

  /**
   * @summary
   * Also prepares base data for the item. 
   * @param {Item} context 
   * @virtual
   */
  prepareBaseData(context) {}

  /**
   * @summary
   * Prepare derived data for the item. 
   * 
   * @description
   * This is where extensive calculations can occur, to ensure properties aren't 
   * undefined and have meaningful values. 
   * 
   * Derived data is *not* persisted!
   * @param {Item} context
   * @virtual
   */
  prepareDerivedData(context) {}
}