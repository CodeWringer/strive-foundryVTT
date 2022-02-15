/**
 * Represents a collection of {ViewModel} objects. 
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
}
