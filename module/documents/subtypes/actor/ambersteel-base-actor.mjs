import { TEMPLATES } from '../../../templatePreloader.mjs';

/**
 * This represents the base type for all actor sub-types to inherit from. 
 * 
 * The contract expected by a concrete `Actor` instance is defined herein. 
 */
export default class AmbersteelBaseActor {
  /**
   * Returns the default icon image path for this type of actor. 
   * @type {String}
   * @virtual
   * @readonly
   */
  get defaultImg() { return "icons/svg/mystery-man.svg"; }

  /**
   * Chat message template path. 
   * @type {String}
   * @readonly
   */
  get chatMessageTemplate() { return TEMPLATES.ACTOR_CHAT_MESSAGE; }

  /**
   * @summary
   * Prepare base data for the actor. 
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
   * @param {Actor} context
   * @virtual
   */
  prepareData(context) {}

  /**
   * @summary
   * Also prepares base data for the actor. 
   * @param {Actor} context 
   * @virtual
   */
  prepareBaseData(context) {}

  /**
   * @summary
   * Prepare derived data for the actor. 
   * 
   * @description
   * This is where extensive calculations can occur, to ensure properties aren't 
   * undefined and have meaningful values. 
   * 
   * Derived data is *not* persisted!
   * @param {Actor} context
   * @virtual
   */
  prepareDerivedData(context) {}
}
