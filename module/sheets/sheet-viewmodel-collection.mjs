import ButtonViewModel from "../components/button/button-viewmodel.mjs";
import InputViewModel from "../components/input-viewmodel.mjs";
import ViewModelCollection from "../utils/viewmodel-collection.mjs";

export default class SheetViewModelCollection extends ViewModelCollection {
  /**
   * @type {DocumentSheet}
   * @private
   */
  _parent = undefined;
  /**
   * @returns {DocumentSheet}
   */
  get parent() { return this._parent; }

  constructor(parent) {
    super();
    this._parent = parent;
  }

  /**
   * Looks up and removes the {ViewModel} with the given id from the global view model collection. 
   * Adds the {ViewModel} instance to this collection and returns it. 
   * @param {String} id 
   * @returns {ViewModel}
   * @throws {Error} NullPointerException
   */
  pullFromGlobal(id) {
    const vm = game.ambersteel.viewModels.get(id);

    if (vm !== undefined) {
      game.ambersteel.viewModels.remove(id);
      this.set(id, vm);
      return vm;
    } else {
      throw new Error(`NullPointerException: Couldn't get {ViewModel} with id '${id}' from global!`);
    }
  }

  /**
   * Registers events on elements of the given DOM. 
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * @param {Boolean} isOwner
   * @param {Boolean} isEditable
   * @throws {Error} NullPointerException - Thrown, if an element is missing an 'id'-attribute. 
   */
  activateListeners(html, isOwner, isEditable) {
    const inputs = this._getAllInputs(html);
    const buttons = this._getAllButtons(html);
    const elements = [];
    for (const elem of inputs) {
      elements.push(elem);
    }
    for (const elem of buttons) {
      elements.push(elem);
    }

    for (const element of elements) {
      const id = element.id;
      if (id === undefined) throw new Error("NullPointerException: id of element must not be undefined!");

      // Remove from global collection and add to this. 
      const vm = this.pullFromGlobal(id);
      // Activate DOM event listeners of view model. 
      vm.activateListeners(html, isOwner, isEditable);
    }
  }

  /**
   * Returns an array of all input fields from the given DOM tree. 
   * @param {HTMLElement | JQuery} html 
   * @private
   */
  _getAllInputs(html) {
    const cssClassEdits = InputViewModel.SELECTOR_EDIT;
    const cssClassReadOnlys = InputViewModel.SELECTOR_READ;

    // This returns JQuery objects. 
    const edits = html.find(`.${cssClassEdits}`);
    const readOnlys = html.find(`.${cssClassReadOnlys}`);

    const result = [];
    for (const elem of edits) {
      result.push(elem);
    }
    for (const elem of readOnlys) {
      result.push(elem);
    }

    return result;
  }

  /**
   * Returns an array of all buttons from the given DOM tree. 
   * @param {HTMLElement | JQuery} html 
   * @private
   */
  _getAllButtons(html) {
    const cssClassButton = ButtonViewModel.SELECTOR_BUTTON;

    // This returns JQuery objects. 
    return html.find(`.${cssClassButton}`);
  }
}