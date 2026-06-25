export const CompareUtility = {
  /**
   * Returns a numeric result that indicates whether the first given number 
   * is larger, smaller or equal to the second given number. 
   * 
   * @param {Number} number1 Number to compare against another. 
   * @param {Number} number2 Number that is compared against. 
   * 
   * @returns {Number} `-1` | `0` | `1` 
   * * `1`, if `number1` is larger.
   * * `-1`, if `number1` is smaller.
   * * `0`, if both numbers are equal.
   */
  compareOrdinal: (number1, number2) => {
    if (number1 > number2) {
      return 1;
    } else if (number1 < number2) {
      return -1;
    } else {
      return 0;
    }
  },
};
