import { GameSystemItemSheet } from "./item-sheet.mjs";

/**
 * Defines an ItemSheet sub-type, specific to one of the Item document types. 
 * 
 * @abstract Inheritors MUST override:
 * * `template`
 * * `localizedType`
 * * `createViewModel`
 * 
 * Inheritors *may* override: 
 * * `getTitle`
 * * `activateListeners`
 * * `getHeaderButtons`
 */
export default class ItemSheetSubType {
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
      viewModel = this.createViewModel(context, document, sheet);
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
  createViewModel(context, document, sheet) { throw new Error("NotImplementedException"); }
  
  /**
   * Register any DOM-reliant event listeners and manipulations here. 
   * 
   * @param {JQuery} html The DOM of the sheet. 
   * 
   * @virtual
   * @async
   */
  async activateListeners(html) { /** Do nothing */}

  /**
   * Returns the button definitions for the sheet's window header bar. 
   * 
   * By default, includes a SendToChat button. 
   * 
   * @param {GameSystemItemSheet} itemSheet 
   * @param {Array<Object>} baseButtons Definitions as they come from FoundryVTT's ItemSheet. 
   * 
   * @returns {Array<Object>} Each object must have the following properties: 
   * * `class: String`
   * * `icon: String`
   * * `onClick: async Function | Function`
   */
  getHeaderButtons(itemSheet, baseButtons) {
    const buttons = baseButtons.concat([]); // Safe-copy.
    if (game.user.isGM || this.isOwner) {
      buttons.splice(0, 0, {
        class: "send-to-chat",
        icon: "fas fa-comments",
        onclick: async () => {
          await new SendToChatHandler().prompt({
            target: itemSheet.viewModel.document,
            dialogTitle: game.i18n.localize("system.general.sendToChat"),
          });
        },
      });
    }
    return buttons;
  }
}
