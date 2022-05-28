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
export function moveArrayElement(arr, element, newIndex) {
  const index = arr.indexOf(element);
  arr.splice(index, 1);
  arr.splice(newIndex, 0, element);
}

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
export function  moveArrayElementBy(arr, element, indices) {
  const index = arr.indexOf(element);
  
  // Determine the new index and ensure the array boundaries are respected. 
  const newIndex = Math.min(Math.max(0, index + indices), arr.length - 1);

  arr.splice(index, 1);
  arr.splice(newIndex, 0, element);
}
