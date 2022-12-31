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
   * Returns a `ChoiceOption`, based on the given object. 
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
   * Returns an object, based on the given `ChoiceOption`.
   * 
   * @param {ChoiceOption} option
   * 
   * @returns {Any}
   * 
   * @abstract
   */
  fromChoiceOption(option) {
    throw new Error("NotImplementedException");
  }
}