import { TEMPLATES } from '../../../templatePreloader.mjs';

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
   * Prepare base data for the Actor. 
   * 
   * This should be non-derivable data, meaning it should only prepare the data object to ensure 
   * certain properties exist and aren't undefined. 
   * This should also set primitive data, even if it is technically derived, shouldn't be any 
   * data set based on extensive calculations. Setting the 'img'-property's path, based on the object 
   * type should be the most complex a 'calculation' as it gets. 
   * 
   * Base data *is* persisted!
   * @param {Actor} context
   * @virtual
   */
  prepareData(context) {
    // Do nothing. Inheriting types must override this method as necessary. 
    // But this has to exist to satisfy the contract with the {Actor} type. 
  }

  /**
   * Also prepares base data for the actor. 
   * @param {Actor} context 
   * @virtual
   */
  prepareBaseData(context) {
    // Do nothing. Inheriting types must override this method as necessary. 
    // But this has to exist to satisfy the contract with the {Actor} type. 
  }

  /**
   * Prepare derived data for the Actor. 
   * 
   * This is where extensive calculations can occur, to ensure properties aren't 
   * undefined and have meaningful values. 
   * 
   * Derived data is *not* persisted!
   * @param {Actor} context
   * @virtual
   */
  prepareDerivedData(context) {
    // Do nothing. Inheriting types must override this method as necessary. 
    // But this has to exist to satisfy the contract with the {Actor} type. 
  }
}
