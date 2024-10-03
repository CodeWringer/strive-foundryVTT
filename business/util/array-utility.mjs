/**
 * @constant
 */
export const ArrayUtil = {
  /**
   * Moves the given element in the given array, to the given index. 
   * 
   * Performs this operation in-place, meaning the given array 
   * is modified directly and not returned.
   * @param {Array<Any>} arr 
   * @param {Any} element 
   * @param {Number} newIndex 
   * @private
   */
  moveArrayElement: function(arr, element, newIndex) {
    const index = arr.indexOf(element);
    arr.splice(index, 1);
    arr.splice(newIndex, 0, element);
  },
  
  /**
   * Moves the given element in the given array, by the given number of indices. 
   * 
   * Performs this operation in-place, meaning the given array 
   * is modified directly and not returned.
   * @param {Array<Any>} arr 
   * @param {Any} element 
   * @param {Number} indices Indices to move. Positive numbers send the element 
   * further back, while negative numbers pull it further to the front. 
   * @private
   */
  moveArrayElementBy: function(arr, element, indices) {
    const index = arr.indexOf(element);
    
    // Determine the new index and ensure the array boundaries are respected. 
    const newIndex = Math.min(Math.max(0, index + indices), arr.length - 1);
  
    arr.splice(index, 1);
    arr.splice(newIndex, 0, element);
  },
  
  /**
   * Returns true, if the given array contains the given element. 
   * 
   * @param {Array<Any>} arr 
   * @param {Any} element 
   * 
   * @returns {Boolean} True, if the given array contains the given element. 
   */
  arrayContains: function(arr, element) {
    return arr.indexOf(element) > -1;
  },
  
  /**
   * Returns a new array, based on the given array and only including elements 
   * for which the given `predicate` function returns `true`. 
   * 
   * @param {Array<Any>} arr An array from which to take elements. 
   * @param {Function} predicate A function that must return `true` for every element 
   * of the given array to keep. 
   * * Receives the element as its sole argument. 
   * 
   * @returns {Array<Any>}
   */
  arrayTakeWhen: function(arr, predicate) {
    const result = [];
  
    for(const element of arr) {
      if (predicate(element) === true) {
        result.push(element);
      }
    }
  
    return result;
  },
  
  /**
   * Returns a new array, based on the given array and only including elements 
   * for which the given `predicate` function returns `false`. 
   * 
   * @param {Array<Any>} arr An array from which to take elements. 
   * @param {Function} predicate A function that must return `false` for every element 
   * of the given array to exclude. 
   * * Receives the element as its sole argument. 
   * 
   * @returns {Array<Any>}
   */
  arrayTakeUnless: function(arr, predicate) {
    const result = [];
  
    for(const element of arr) {
      if (predicate(element) === false) {
        result.push(element);
      }
    }
  
    return result;
  },
}
