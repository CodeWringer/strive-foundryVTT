/**
 * Represents a collection/list whose data set changes can be observed/listened for. 
 */
export default class ObservableCollection {
  /**
   * @type {Array<Any>}
   * @private
   */
  _array = [];

  /**
   * @param {Object} args 
   * @param {Array<Any>} args.items
   * @param {Function} args.onChange Callback that is invoked whenever 
   * the data set changes in any way. 
   */
  constructor(args = {}) {
    this._array = args.items ?? [];
  }

  /**
   * Returns the element at the given index. 
   * 
   * @param {Number} index The index of the element to get. 
   * 
   * @returns {Any} The element at the given index. 
   */
  get(index) {
    if (index < 0 || index > this._array.length) {
      throw new Error("Index out of bounds");
    } else {
      return this._array[index];
    }
  }

  /**
   * Adds the given element at the end of the collection.
   * 
   * @param {Any} element 
   */
  add(element) {

  }

  /**
   * Adds the given element at the given index. 
   * 
   * @param {number} index 
   * @param {any} element 
   */
  addAt(index, element) {

  }

  /**
   * Removes the given element. 
   * 
   * @param {any} element 
   */
  remove(element) {

  }

  /**
   * Removes and returns the element at the given index. 
   * 
   * @param {number} index 
   * 
   * @returns {any}
   */
  removeAt(index) {

  }
}