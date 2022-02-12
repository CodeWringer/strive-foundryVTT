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
}