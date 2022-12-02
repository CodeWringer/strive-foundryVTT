/**
 * Represents the definition of a specific sub-type of `ViewModel` . 
 * 
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
   * @throws {Error} InvalidArgumentException: Thrown, if any required arguments are left undefined. 
   */
  constructor(factoryFunc, argumentNames) {
    if (factoryFunc === undefined || factoryFunc === null) throw new Error("InvalidArgumentException: factoryFunc must not be null or undefined");
    if (argumentNames === undefined || argumentNames === null) throw new Error("InvalidArgumentException: argumentNames must not be null or undefined");

    this.factoryFunc = factoryFunc;
    this.argumentNames = argumentNames;
  }
}