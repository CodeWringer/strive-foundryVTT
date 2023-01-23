/**
 * Represents the possible changes of a collection. 
 * 
 * @property {number} ADD One or more elements were added. 
 * @property {number} REMOVE One or more elements were removed. 
 * @property {number} CLEAR All elements were removed. 
 * 
 * @constant
 */
export const CollectionChangeTypes = {
  ADD: 0,
  REMOVE: 1,
  CLEAR: 2,
};

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
   * @param {Array<Any> | undefined} args.elements An initial set of elements to 
   * add to the collection. 
   * @param {Function | undefined} args.onChange Callback that is invoked whenever 
   * the data set changes in any way. 
   * * Receives two arguments when called: 
   * * * `change: CollectionChangeTypes`
   * * * `elements: Array<any>`
   */
  constructor(args = {}) {
    this._array = args.elements ?? [];
    this.onChange = args.onChange ?? this.onChange;
  }

  /**
   * Invoked whenever the collection is changed. 
   * 
   * @param {CollectionChangeTypes} change 
   * @param {Array<any>} elements One of more elements that were changed. 
   * 
   * @virtual
  */
 onChange(change, elements) { /* Implementation up to user. */}

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
   * Returns all elements. 
   * 
   * @returns {Array<Any>} The element at the given index. 
   */
  getAll() {
    return this._array;
  }

  /**
   * Adds the given element at the end of the collection.
   * 
   * @param {Any} element 
   */
  add(element) {
    this._array.push(element);
    this.onChange(CollectionChangeTypes.ADD, [element]);
  }

  /**
   * Adds the given element at the given index. 
   * 
   * @param {number} index 
   * @param {any} element 
   */
  addAt(index, element) {
    this._array.splice(index, 0, element);
    this.onChange(CollectionChangeTypes.ADD, [element]);
  }

  /**
   * Adds the given elements to the end of the collection.
   * 
   * @param {Array<any>} elements 
   */
  addAll(elements) {
    this._array = this._array.concat(elements);
    this.onChange(CollectionChangeTypes.ADD, elements);
  }

  /**
   * Removes the given element. 
   * 
   * @param {any} element 
   */
  remove(element) {
    const index = this._array.indexOf(element);
    this._array.splice(index, 1);
    this.onChange(CollectionChangeTypes.REMOVE, [element]);
  }

  /**
   * Removes and returns the element at the given index. 
   * 
   * @param {number} index 
   * 
   * @returns {any}
   */
  removeAt(index) {
    const elements = this._array.splice(index, 1);
    this.onChange(CollectionChangeTypes.REMOVE, elements);
  }

  /**
   * Removes all elements. 
   */
  clear() {
    const elements = this._array.concat([]);
    this._array = [];
    this.onChange(CollectionChangeTypes.REMOVE, elements);
  }
}