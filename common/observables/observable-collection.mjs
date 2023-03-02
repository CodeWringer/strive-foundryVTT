import { EventEmitter } from "../event-emitter.mjs";

/**
 * Represents the possible changes of a collection. 
 * 
 * @property {Number} ADD One or more elements were added. 
 * @property {Number} REMOVE One or more elements were removed. 
 * @property {Number} MOVE One or more elements were moved / re-ordered. 
 * @property {Number} REPLACE One or more elements were replaced. 
 * @property {Number} ELEMENT One or more elements' internal state changed. 
 * * This change can only occur for `object`s, which support a `onChange` method. 
 * 
 * @constant
 */
export const CollectionChangeTypes = {
  ADD: 0,
  REMOVE: 1,
  MOVE: 2,
  REPLACE: 3,
  ELEMENT: 4,
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
   * A wrapped array instance. 
   * 
   * As a collection user DO **NOT** MODIFY THIS ARRAY DIRECTLY! 
   * Changes will not be trackable, if applied directly to this array. 
   * 
   * @type {Array<Any>}
   * @private
   */
  _array = [];

  /**
   * Internally handles the `onChange` event. 
   * 
   * @type {EventEmitter}
   * @private
   */
  _eventEmitter;

  /**
   * Maps elements to their `onChange` callback IDs. 
   * 
   * @type {Map<any, String>}
   * @private
   */
  _elementCallbackIds = new Map();

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
    // Ensure a safe-copy of the array. Using the given array reference would imply 
    // allowing this class to modify the given array, which would be unexpected behavior. 
    this._array = (args.elements ?? []).concat([]);
    this._eventEmitter = new EventEmitter();

    for (const element of this._array) {
      this._setOnChangeOnElementIfPossible(element);
    }
  }

  /**
   * Registers an event listener that is invoked whenever the value is changed. 
   * 
   * @param {Function | undefined} onChange Callback that is invoked whenever 
   * the data set changes in any way. 
   * * See the other methods for a description on the arguments to expect, 
   * when the `callback` is invoked. 
   * 
   * @returns {String} An id to refer to the registered callback to. 
   */
  onChange(callback) {
    return this._eventEmitter.on(ObservableCollection.EVENT_ON_CHANGE, callback);
  }

  /**
   * Un-registers an event listener with the given id. 
   * 
   * @param {String | undefined} callbackId A callback ID to un-register or 
   * `undefined`, to un-register **all** callbacks. 
   */
  offChange(callbackId) {
    if (callbackId === undefined) {
      this._eventEmitter.allOff(ObservableCollection.EVENT_ON_CHANGE);
    } else {
      this._eventEmitter.off(callbackId);
    }
  }

  /**
   * Returns the element at the given index. 
   * 
   * @param {Number} index The index of the element to get. 
   * 
   * @returns {Any | undefined} The element at the given index or `undefined`, 
   * if there is no element at the given index. 
   */
  get(index) {
    if (index < 0 || index > this._array.length - 1) {
      return undefined;
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
   * Returns true, if the given element is contained.
   * 
   * @param {any} element The element to check for whether it is contained. 
   * 
   * @returns {Boolean} True, if the element is contained.
   */
  contains(element) {
    return this.indexOf(element) > -1;
  }

  /**
   * Returns all elements. 
   * 
   * Modifying the returned array **does not** modify the collection!
   * 
   * @returns {Array<Any>} The element at the given index. 
   */
  getAll() {
    return this._array.concat([]);
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

    this._setOnChangeOnElementIfPossible(element);
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

    this._setOnChangeOnElementIfPossible(element);
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

    for (const element of elements) {
      this._setOnChangeOnElementIfPossible(element);
    }
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
   
    this._unsetOnChangeOnElementIfPossible(element);
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
   
    this._unsetOnChangeOnElementIfPossible(elements[0]);
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
    
    for (const element of elements) {
      this._unsetOnChangeOnElementIfPossible(element);
    }
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
   * Attempts to replace the given element with the given element. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.REPLACE`
   * * `replaced: Any`
   * * `replacedWith: Any`
   * 
   * @param {Any} elementToReplace The element to replace. 
   * @param {Any} element The element to replace with. 
   * 
   * @throws Thrown, if the `elementToReplace` is not contained in this collection. 
   */
  replace(elementToReplace, element) {
    const index = this._array.indexOf(elementToReplace);

    if (index < 0) {
      throw new Error("Element to replace not contained");
    }

    this._array.splice(index, 1);
    this._array.splice(index, 0, element);

    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REPLACE, elementToReplace, element);
    this._unsetOnChangeOnElementIfPossible(elementToReplace);
    this._setOnChangeOnElementIfPossible(element);
  }

  /**
   * Attempts to replace an element at the given index with the given element. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.REPLACE`
   * * `replaced: Any`
   * * `replacedWith: Any`
   * * `index: Number`
   * 
   * @param {Number} index Index of the element to replace. 
   * @param {Any} element The element to replace with. 
   * 
   * @throws Thrown, if the `index` is out of bounds. 
   */
  replaceAt(index, element) {
    if (index < 0 || index > this._array.length - 1) {
      throw new Error("Index out of bounds");
    }

    const replaced = this._array.splice(index, 1)[0];
    this._array.splice(index, 0, element);

    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REPLACE, replaced, element);
    this._unsetOnChangeOnElementIfPossible(replaced);
    this._setOnChangeOnElementIfPossible(element);
  }

  /**
   * Replaces the entire collection's contents with the given array of elements. 
   * 
   * Invokes event listeners with the following arguments:
   * * `change: CollectionChangeTypes.REPLACE`
   * * `replaced: Array<Any>`
   * * `replacedWith: Array<Any>`
   * 
   * @param {Array<Any>} elements The new array of elements for the collection. 
   */
  replaceAll(elements) {
    const replaced = this._array.concat([]);
    const replacedWith = elements.concat([]); // This ensures an array. 
    this._array = replacedWith;

    this._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.REPLACE, replaced, replacedWith);

    for (const element of replaced) {
      this._unsetOnChangeOnElementIfPossible(element);
    }
    for (const element of replacedWith) {
      this._setOnChangeOnElementIfPossible(element);
    }
  }

  /**
   * Disposes of any working data. 
   */
  dispose() {
    this.clear();
    this._eventEmitter.allOff();
    this._elementCallbackIds.clear();
  }
  
  /**
   * Attaches a `onChange` callback to the given element, 
   * if it supports the method. 
   * 
   * @param {any} element 
   * 
   * @private
   */
  _setOnChangeOnElementIfPossible(element) {
    if (element.onChange === undefined) {
      return;
    }

    const thiz = this;
    const callbackId = element.onChange((field, oldValue, newValue) => {
      thiz._eventEmitter.emit(ObservableCollection.EVENT_ON_CHANGE, CollectionChangeTypes.ELEMENT, field, oldValue, newValue);
    });
    this._elementCallbackIds.set(element, callbackId);
  }
  
  /**
   * Detaches the `onChange` callback of the given element, 
   * if it supports the method. 
   * 
   * @param {any} element 
   * 
   * @private
   */
  _unsetOnChangeOnElementIfPossible(element) {
    if (element.onChange === undefined) {
      return;
    }

    const callbackId = this._elementCallbackIds.get(element);
    if (callbackId !== undefined) {
      // In case the callback ID being undefined, avoid un-registering 
      // **all** callbacks, which is what would happen, if undefined 
      // were passed to the element's offChange method. 
      // 
      // After all, there may be other consumers of the element's 
      // onChange event which should remain unaffected. 
      element.offChange(callbackId);
    }
    this._elementCallbackIds.delete(element);
  }
}