import SheetViewModel from "./sheet-viewmodel.mjs";
import { SELECTOR_BUTTON } from "../module/components/button/button-viewmodel.mjs";
import { SELECTOR_EDIT, SELECTOR_READ } from "../module/components/input-viewmodel.mjs";
import { createUUID } from "../module/utils/uuid-utility.mjs";
import ButtonAddViewModel from "../module/components/button-add/button-add-viewmodel.mjs";

/**
 * This view model is intended to be used as the base type for chat message view models. 
 * @extends SheetViewModel
 */
export default class ChatMessageViewModel extends SheetViewModel {
  /**
   * @type {Map<String, ViewModel>}
   * @readonly
   */
  globalViewModelCollection = undefined;

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   * 
   * @param {Map<String, ViewModel> | undefined} args.globalViewModelCollection The global view model collection. 
   */
  constructor(args = {}) {
    super(args);

    this.globalViewModelCollection = args.globalViewModelCollection ?? game.ambersteel.viewModels;
  }

  /** @override */
  toViewState() {
    return super.toViewState();
  }

  /** @override */
  applyViewState(viewState) {
    super.applyViewState(viewState);
  }

  /**
   * Registers events on elements of the given DOM. 
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * @param {Boolean} isOwner If true, registers events that require owner permission. 
   * @param {Boolean} isEditable If true, registers events that require editing permission. 
   * @throws {Error} NullPointerException - Thrown if the input element could not be found. 
   */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);
  }

  // /**
  //  * Looks up and removes the {ViewModel} with the given id from the global view model collection. 
  //  * Adds the {ViewModel} instance to this collection and returns it. 
  //  * @param {String} id 
  //  * @returns {ViewModel}
  //  * @throws {Error} NullPointerException
  //  * @private
  //  */
  // _pullFromGlobal(id) {
  //   const vm = this.globalViewModelCollection.get(id);

  //   if (vm !== undefined) {
  //     this.globalViewModelCollection.remove(id);
  //     return vm;
  //   } else {
  //     throw new Error(`NullPointerException: Couldn't get {ViewModel} with id '${id}' from global!`);
  //   }
  // }

  // /**
  //  * Returns an array of all input fields from the given DOM tree. 
  //  * @param {HTMLElement | JQuery} html 
  //  * @private
  //  */
  // _getAllInputs(html) {
  //   const cssClassEdits = SELECTOR_EDIT;
  //   const cssClassReadOnlys = SELECTOR_READ;

  //   // This returns JQuery objects. 
  //   const edits = html.find(`.${cssClassEdits}`);
  //   const readOnlys = html.find(`.${cssClassReadOnlys}`);

  //   const result = [];
  //   for (const elem of edits) {
  //     result.push(elem);
  //   }
  //   for (const elem of readOnlys) {
  //     result.push(elem);
  //   }

  //   return result;
  // }

  // /**
  //  * Returns an array of all buttons from the given DOM tree. 
  //  * @param {HTMLElement | JQuery} html 
  //  * @private
  //  */
  // _getAllButtons(html) {
  //   const cssClassButton = SELECTOR_BUTTON;

  //   // This returns JQuery objects. 
  //   return html.find(`.${cssClassButton}`);
  // }
}
