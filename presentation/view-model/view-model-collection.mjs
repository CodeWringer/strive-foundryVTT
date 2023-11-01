import { SELECTOR_BUTTON } from "../component/button/button-viewmodel.mjs";
import { SELECTOR_EDIT, SELECTOR_READ } from "./input-view-model.mjs";

/**
 * Represents a collection of `ViewModel` objects. 
 * 
 * @see {ViewModel}
 * 
 * @property {Object} viewModels Represents a map of view model ids to their instances. 
 */
export default class ViewModelCollection {
  /**
   * @type {Object}
   * @private
   */
  _viewModels = Object.create(null); // Intentionally created with null as its prototype. It's only ever supposed to be a "dumb" map of objects. 
  /**
   * @type {Object}
   * @readonly
   */
  get viewModels() { return this._viewModels; }

  /**
   * Adds or overwrites a view model at the given id. 
   * @param {String} id 
   * @param {ViewModel} vm 
   */
  set(id, vm) {
    this._viewModels[id] = vm;
  }

  /**
   * Removes a view model whose id matches the given id. 
   * @param {String} id 
   */
  remove(id) {
    delete this._viewModels[id];
  }

  /**
   * Returns a single view model, whose id matches with the given id. 
   * @param {String} id 
   * @returns {ViewModel}
   */
  get(id) {
    return this._viewModels[id];
  }

  /**
   * Returns an array of id-vm-pairs. 
   * @returns {Array<ViewModel>} Array of objects in format { id: {String}, vm: {Object} }
   */
  getAll() {
    const arr = [];
    for (const prop in this._viewModels) {
      arr.push({ id: prop, vm: this._viewModels[prop] });
    }
    return arr;
  }

  /**
   * Clears all saved view models. 
   */
  clear() {
    // Completely throw away the view models object and then re-create it. 
    delete this._viewModels;
    this._viewModels = Object.create(null);
  }

  /**
   * Disposes of this view model collection and any view models it contains. 
   * 
   * No members of a disposed instance may/can be used after this function has been called!
   */
  dispose() {
    const vms = this.getAll();
    for (const idVmPair of vms) {
      if (idVmPair.vm.dispose !== undefined) {
        idVmPair.vm.dispose();
      }
    }
    this._viewModels = null;
  }

  /**
   * Registers events on elements of the given DOM. 
   * 
   * @param {Object} html DOM of the sheet for which to register listeners. 
   * 
   * @throws {Error} NullPointerException - Thrown, if an element is missing an 'id'-attribute. 
   * 
   * @async
   */
  async activateListeners(html) {
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
      const vm = this._pullFromGlobal(id);
      // Activate DOM event listeners of view model. 
      await vm.activateListeners(html);
    }
  }

  /**
   * Looks up and removes the {ViewModel} with the given id from the global view model collection. 
   * Adds the {ViewModel} instance to this collection and returns it. 
   * @param {String} id 
   * @returns {ViewModel}
   * @throws {Error} NullPointerException
   * @private
   */
  _pullFromGlobal(id) {
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
   * Returns an array of all input fields from the given DOM tree. 
   * @param {HTMLElement | JQuery} html 
   * @private
   */
  _getAllInputs(html) {
    const cssClassEdits = SELECTOR_EDIT;
    const cssClassReadOnlys = SELECTOR_READ;

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
    const cssClassButton = SELECTOR_BUTTON;

    // This returns JQuery objects. 
    return html.find(`.${cssClassButton}`);
  }
}
