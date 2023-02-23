import { EventEmitter } from "../event-emitter.mjs";

/**
 * Represents the possible changes of a collection. 
 * 
 * @property {number} ADD One or more elements were added. 
 * @property {number} REMOVE One or more elements were removed. 
 * @property {number} MOVE One or more elements were moved / re-ordered. 
 * 
 * @constant
 */
export const CollectionChangeTypes = {
  ADD: 0,
  REMOVE: 1,
  MOVE: 2,
};

/**
 * Represents a collection/list whose data set changes can be observed/listened for. 
 * 
 * @property {Number} length Returns the current number of items in the collection. 
 * * Read-only
 */
export default class ObservableCollection {
  /**
   * Event key for the "onChange" event. 
   * 
   * @static
   * @type {String}
   */
  static EVENT_ON_CHANGE = "collectionOnChange";

  /**
   * @type {Array<Any>}
   * @private
   */
  _array = [];

  /**
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter;

  /**
   * Returns the current number of elements in the collection. 
   * 
   * @type {number}
   * @readonly
   */
  get length() { return this._array.length; }

  /**
   * @param {Object} args 
   * @param {Array<Any> | undefined} args.elements An initial set of elements to 
   * add to the collection. 
   */
  constructor(args = {}) {
    this._array = args.elements ?? [];
    this._eventEmitter = new EventEmitter();
  }

  /**
   * Invoked whenever the collection is changed. 
   * 
   * @param {Function | undefined} onChange Callback that is invoked whenever 
   * the data set changes in any way. 
   * * See the other methods for a description on the arguments to expect, 
   * when the `callback` is invoked. 
  */
 onChange(callback) {
  this._eventEmitter.on(ObservableCollection.EVENT_ON_CHANGE, callback);
 }

  /**
   * Returns the element at the given index. 
   * 
   * @param {Number} index The index of the element to get. 
   * 
   * @returns {Any} The element at the given index. 
   * 
   * @throws Thrown, if the given index is out of bounds. 
   */
  get(index) {
    if (index < 0 || index > this._array.length) {
      throw new Error("Index out of bounds");
    } else {
      return this._array[index];
    }
  }

  /**
   * Returns the index of the given element, if possible. If the element could 
   * not be found, returns `-1`. 
   * 
   * @param {any} element The element whose index to return. 
   * 
   * @returns {Number} The index of the element or -1, if no element 
   * was found. 
   */
  indexOf(element) {
    return this._array.indexOf(element);
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
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.ADD`
   * * `elements: Array<Any>`
   * * `index: Number`
   * 
   * @param {Any} element 
   */
  add(element) {
    const index = this._array.length;
    this._array.push(element);
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.ADD, [element], index);
  }

  /**
   * Adds the given element at the given index. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.ADD`
   * * `elements: Array<Any>`
   * * `index: Number`
   * 
   * @param {number} index 
   * @param {any} element 
   */
  addAt(index, element) {
    this._array.splice(index, 0, element);
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.ADD, [element], index);
  }

  /**
   * Adds the given elements to the end of the collection.
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.ADD`
   * * `elements: Array<Any>`
   * * `index: Number`
   * 
   * @param {Array<any>} elements 
   */
  addAll(elements) {
    const index = this._array.length;
    this._array = this._array.concat(elements);
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.ADD, elements, index);
  }

  /**
   * Removes the given element. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.REMOVE`
   * * `elements: Array<Any>`
   * * `index: Number`
   * 
   * @param {any} element 
   */
  remove(element) {
    const index = this._array.indexOf(element);
    this._array.splice(index, 1);
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REMOVE, [element], index);
  }

  /**
   * Removes and returns the element at the given index. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.REMOVE`
   * * `elements: Array<Any>`
   * * `index: Number`
   * 
   * @param {Number} index 
   * 
   * @returns {Any}
   */
  removeAt(index) {
    const elements = this._array.splice(index, 1);
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REMOVE, elements, index);
  }

  /**
   * Removes all elements. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.REMOVE`
   * * `elements: Array<Any>`
   */
  clear() {
    const elements = this._array.concat([]);
    this._array = [];
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REMOVE, elements);
  }

  /**
   * Moves an element at the given index to the given index. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.MOVE`
   * * `oldIndex: Number`
   * * `newIndex: Number`
   * 
   * @param {Number} fromIndex Index of the element to move. 
   * @param {Number} toIndex Index to move the element to.
   * 
   * @throws Thrown, if the given `fromIndex` is out of bounds. 
   */
  move(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex > this._array.length - 1) {
      throw new Error("Index out of bounds");
    }

    // Ensure the new index remains bounded. 
    const newIndex = Math.max(Math.min(this._array.length - 1, toIndex), 0);

    // "Move" the object by first removing and then re-inserting it at the desired index. 
    const element = this._array.splice(fromIndex, 1)[0];
    this._array.splice(newIndex, 0, element);

    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.MOVE, fromIndex, newIndex);
  }

  /**
   * Sorts the collection in place. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.MOVE`
   * * `oldElements: Array<Any>`
   * * `newElements: Array<Any>`
   * 
   * @param {Function} sortFunc Function used to determine the order of the elements. 
   * It is expected to return a negative value if the first argument is less than 
   * the second argument, zero if they're equal, and a positive value otherwise. 
   * If omitted, the elements are sorted in ascending, ASCII character order.
   * ```JS
   * [11,2,22,1].sort((a, b) => a - b)
   * ```
   */
  sort(sortFunc) {
    const oldElements = this._array.concat([]);
    this._array.sort(sortFunc);
    const newElements = this._array.concat([]);

    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.MOVE, oldElements, newElements);
  }
  
  /**
  * Disposes of any working data. 
  */
  dispose() {
    this._eventEmitter.allOff();
  }
}