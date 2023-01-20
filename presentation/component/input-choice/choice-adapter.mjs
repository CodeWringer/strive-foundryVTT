/**
 * Represents an adapter of an object or primitive type to a `ChoiceOption`. 
 */
export default class ChoiceAdapter {
  /**
   * @param {Object} args 
   * @param {Function | undefined} args.toChoiceOption A function that returns a `ChoiceOption`, 
   * based a the given object. 
   * @param {Function | undefined} args.fromChoiceOption A function that returns an object, 
   * based on the given `ChoiceOption`.
   */
  constructor(args = {}) {
    this.toChoiceOption = args.toChoiceOption ?? this.toChoiceOption;
    this.fromChoiceOption = args.fromChoiceOption ?? this.fromChoiceOption;
  }

  /**
   * Converts a business object to a `ChoiceOption` and returns it. 
   * 
   * @param {Any} obj 
   * 
   * @returns {ChoiceOption}
   * 
   * @abstract
   */
  toChoiceOption(obj) {
    throw new Error("NotImplementedException");
  }

  /**
   * Converts a `ChoiceOption` to a business object and returns it. 
   * 
   * @param {ChoiceOption} choice
   * @param {Array<Any>} items
   * 
   * @returns {Any}
   * 
   * @abstract
   */
  fromChoiceOption(choice, items) {
    throw new Error("NotImplementedException");
  }
}