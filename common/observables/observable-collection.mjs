import { EventEmitter } from "../event-emitter.mjs";

/**
 * Represents the possible changes of a collection. 
 * 
 * @property {number} ADD One or more elements were added. 
 * @property {number} REMOVE One or more elements were removed. 
 * 
 * @constant
 */
export const CollectionChangeTypes = {
  ADD: 0,
  REMOVE: 1,
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
   * * Receives two arguments when called: 
   * * * `change: CollectionChangeTypes`
   * * * `elements: Array<any>`
   * * * `index: Number | undefined`
   * 
   * @virtual
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
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.ADD, [element]);
  }

  /**
   * Adds the given element at the given index. 
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
   * @param {Array<any>} elements 
   */
  addAll(elements) {
    this._array = this._array.concat(elements);
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.ADD, elements);
  }

  /**
   * Removes the given element. 
   * 
   * @param {any} element 
   */
  remove(element) {
    const index = this._array.indexOf(element);
    this._array.splice(index, 1);
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REMOVE, [element]);
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
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REMOVE, elements, index);
  }

  /**
   * Removes all elements. 
   */
  clear() {
    const elements = this._array.concat([]);
    this._array = [];
    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REMOVE, elements);
  }
  
  /**
  * Disposes of any working data. 
  */
  dispose() {
    this._eventEmitter.allOff();
  }
}