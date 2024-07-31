/**
 * Represents the abstract base contract for a "specific" item sheet "sub-type". 
 * 
 * Such a "sub-type" is really only an "enhancer", which adds properties and/or methods to a given `ItemSheet` instance. 
 * 
 * @abstract
 */
export default class GameSystemBaseItemSheet {
  /**
   * Returns the template path. 
   * 
   * @type {String}
   * @readonly
   * @abstract
   */
  get template() { throw new Error("NotImplementedException"); }

  /**
   * Returns the localized type of this sheet. 
   * 
   * @type {String}
   * @readonly
   * @abstract
   */
  get localizedType() { throw new Error("NotImplementedException"); }

  /**
   * Returns the localized title of this sheet. 
   * 
   * @param {Object} item
   * @returns {String}
   * @readonly
   * @abstract
   */
  getTitle(item) { return `${this.localizedType} - ${item.name}` }

  /**
   * Returns a view model for the given document. 
   * 
   * Supports caching the view model instance, based on the `game.strive.enableViewModelCaching` value. 
   * 
   * @param {Object} context A context object provided by FoundryVTT. 
   * @param {TransientDocument} document A transient document instance of "this" type of item sheet. 
   * @param {ItemSheet} sheet The sheet instance to return a view model instance for. 
   * 
   * @returns {ViewModel}
   * 
   * @protected
   */
  getViewModel(context, document, sheet) {
    let viewModel = game.strive.viewModels.get(document.id);
    if (viewModel === undefined) {
      viewModel = this._getViewModel(context, document, sheet);
      if (game.strive.enableViewModelCaching === true) {
        game.strive.viewModels.set(document.id, viewModel);
      }
    } else {
      viewModel.update({
        isEditable: context.isEditable,
        isSendable: context.isSendable,
        isOwner: context.isOwner,
      });
    }
    return viewModel;
  }
  
  /**
   * Returns a new view model instance for the given document. 
   * 
   * @param {Object} context A context object provided by FoundryVTT. 
   * @param {TransientDocument} document A transient document instance of "this" type of item sheet. 
   * @param {ItemSheet} sheet The sheet instance to return a view model instance for. 
   * 
   * @returns {ViewModel}
   * 
   * @abstract
   * @protected
   */
  _getViewModel(context, document, sheet) { throw new Error("NotImplementedException"); }
  
  /**
   * Register any DOM-reliant event listeners and manipulations here. 
   * 
   * @param {JQuery} html The DOM of the sheet. 
   * 
   * @virtual
   * @async
   */
  async activateListeners(html) { /** Do nothing */}
}
