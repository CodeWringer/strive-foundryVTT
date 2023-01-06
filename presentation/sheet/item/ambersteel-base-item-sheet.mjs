/**
 * Represents the abstract base contract for a "specific" item sheet "sub-type". 
 * 
 * Such a "sub-type" is really only an "enhancer", which adds properties and/or methods to a given `ItemSheet` instance. 
 * 
 * @abstract
 */
export default class AmbersteelBaseItemSheet {
  /**
   * Returns the template path. 
   * 
   * @type {String}
   * @readonly
   * @abstract
   */
  get template() { throw new Error("NotImplementedException"); }

  /**
   * Returns the localized title of this sheet type. 
   * 
   * @type {String}
   * @readonly
   * @abstract
   */
  get title() { throw new Error("NotImplementedException"); }

  /**
   * Returns a view model for the given document. 
   * 
   * @param {Object} context A context object provided by FoundryVTT. 
   * @param {TransientDocument} document A transient document instance of "this" type of item sheet. 
   * 
   * @returns {ViewModel}
   * 
   * @abstract
   */
  getViewModel(context, document) { throw new Error("NotImplementedException"); }
  
  /**
   * Register any DOM-reliant event listeners and manipulations here. 
   * 
   * @param {JQuery} html The DOM of the sheet. 
   * @param {Boolean | undefined} isOwner If true, the current user is regarded as 
   * the represented document's owner. 
   * @param {Boolean | undefined} isEditable If true, the sheet will be editable. 
   * 
   * @virtual
   */
  activateListeners(html, isOwner, isEditable) { /** Do nothing */}
}
