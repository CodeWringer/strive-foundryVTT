import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import ViewModel from "./view-model.mjs";

/**
 * Represents a collection of `ViewModel` objects. 
 * 
 * @see {ViewModel}
 * 
 * @property {Object} viewModels Represents a map of view model ids to their instances. 
 */
export default class ViewModelCollection {
  /**
   * @type {Map<String, ViewModel>}
   * @private
   */
  #viewModels = new Map();

  /**
   * Adds the given view model instance. 
   * @param {ViewModel} vm 
   */
  add(vm) {
    this.#viewModels.set(vm.id, vm);
  }

  /**
   * Removes a view model whose id matches the given id. 
   * @param {String} id 
   * @returns {Boolean} `true`, if an entry with the given id was successfully removed. 
   */
  remove(id) {
    return this.#viewModels.delete(id);
  }

  /**
   * Returns a single view model, whose id matches with the given id. 
   * @param {String} id 
   * @returns {ViewModel | undefined}
   */
  get(id) {
    return this.#viewModels.get(id);
  }

  /**
   * Returns all view model instances.
   * @returns {Array<ViewModel>}
   */
  getAll() {
    const arr = [];
    for (const vm of this.#viewModels.values()) {
      arr.push(vm);
    }
    return arr;
  }

  /**
   * Clears all saved view models. 
   */
  clear() {
    this.#viewModels.clear()
  }

  /**
   * Disposes of this view model collection and any view models it contains. 
   * 
   * No members of a disposed instance may/can be used after this function has been called!
   */
  dispose() {
    const vms = this.getAll();
    for (const vm of vms) {
      if (ValidationUtil.isDefined(vm.dispose)) {
        vm.dispose();
      }
    }
    this.#viewModels = null;
  }
}
