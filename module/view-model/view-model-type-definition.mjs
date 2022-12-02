/**
 * Represents the definition of a specific sub-type of `ViewModel` . 
 * 
 * @property {String} id `ViewModel` sub-type key. E. g. `"InputTextFieldViewModel"`. 
 * @property {Function} factoryFunc Factory function that encapsulates the instantiation 
 * of a new instance of a `ViewModel` of the represented type. 
 * @property {Array<String>} argumentNames An **order-sensitive** list of argument names 
 * to pass to the factory function. 
 * 
 * For example, `["propertyOwner", "propertyPath"]` dictate the names of the properties 
 * that will be added to the `args` object that will be passed to the factory function. 
 * The order in which the property names appear is the order in which the argument values 
 * are alotted. 
 */
export default class ViewModelTypeDefinition {
  /**
   * @param {String} id `ViewModel` sub-type key. E. g. `"InputTextFieldViewModel"`. 
   * @param {Function} factoryFunc Factory function that encapsulates the instantiation 
   * of a new instance of a `ViewModel` of the represented type. 
   * @param {Array<String>} argumentNames An **order-sensitive** list of argument names 
   * to pass to the factory function. 
   * 
   * For example, `["propertyOwner", "propertyPath"]` dictate the names of the properties 
   * that will be added to the `args` object that will be passed to the factory function. 
   * The order in which the property names appear is the order in which the argument values 
   * are alotted. 
   * 
   * @throws {Error} Thrown, if any required arguments are left undefined. 
   */
  constructor(id, factoryFunc, argumentNames) {
    if (id === undefined || id === null) throw new Error("InvalidArgumentException: id must not be null or undefined");
    if (factoryFunc === undefined || factoryFunc === null) throw new Error("InvalidArgumentException: factoryFunc must not be null or undefined");
    if (argumentNames === undefined || argumentNames === null) throw new Error("InvalidArgumentException: argumentNames must not be null or undefined");

    this.id = id;
    this.factoryFunc = factoryFunc;
    this.argumentNames = argumentNames;
  }
}