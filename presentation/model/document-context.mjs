/**
 * Represents the context within which an application may operate. 
 * 
 * @constant
 */
export const DOCUMENT_CONTEXT = {
  /**
   * A document embedded in another. 
   */
  embedded: 0,
  /**
   * A document embedded in another that is part of a locked compendium pack. 
   */
  embedded_locked: 1,
  /**
   * An unimbedded document. 
   */
 independent: 2,
  /**
   * An unimbedded document that is part of a locked compendium pack. 
   */
  independent_locked: 3,
};
