import ActorSheetViewModel from "./actor-sheet-viewmodel.mjs";

/**
 * Represents the base contract for a "specific" actor sheet "sub-type". 
 * 
 * Such a "sub-type" is really on an "enhancer", which adds properties and/or methods to a given `ActorSheet` instance. 
 * 
 * This particular type also doubles as the definition for the actor of type `"plain"`. 
 */
export default class GameSystemBaseActorSheet {
  /**
   * Returns the template path. 
   * @type {String} Path to the template. 
   * @readonly
   * @virtual
   */
  get template() { return game.strive.const.TEMPLATES.ACTOR_SHEET;  }

  /**
   * Returns the localized title of this sheet type. 
   * @type {String}
   * @readonly
   */
  get title() { return game.i18n.localize("system.general.actor.plain.label"); }

  /**
   * Returns a view model for the given document. 
   * 
   * Supports caching the view model instance, based on the `game.strive.enableViewModelCaching` value. 
   * 
   * @param {Object} context A context object provided by FoundryVTT. 
   * @param {TransientDocument} document A transient document instance of "this" type of item sheet. 
   * @param {ActorSheet} sheet The sheet instance to return a view model instance for. 
   * 
   * @returns {ActorSheetViewModel}
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
   * @param {ActorSheet} sheet The sheet instance to return a view model instance for. 
   * 
   * @returns {ActorSheetViewModel}
   * 
   * @protected
   * @virtual
   */
  _getViewModel(context, document, sheet) {
    return new ActorSheetViewModel({
      id: document.id,
      document: document.getTransientObject(),
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      sheet: sheet,
    });
  }
  
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
