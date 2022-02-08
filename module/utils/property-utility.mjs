/**
 * Returns the value of a nested property. 
 * 
 * Supports array-access-notation. Does not support accessing properties via '[<propName>]'.
 * @param {Object} obj The object whose nested property is to be returned. 
 * @param {String} path The property path. 
 *        Separate properties with dot-notation. 
 *        Access arrays with bracket-notation. 
 *        E. g. "abilities[4].name"
 * @returns {Any} If the property in question is an object, returns that object, 
 * otherwise, returns the value of the property. 
 */
export function getNestedPropertyValue(obj, path) {
  const properties = path.split(/\.|\[/);

  function _get(obj, properties, originalObj) {
    if (!properties || properties.length === 0) return obj;

    const prop = properties.shift().replace("]", "");
    if (!hasProperty(obj, prop)) {
      game.ambersteel.logger.logWarn(`Failed to get value of property at '${path}'! Original context object:`, originalObj);
      return undefined;
    } else {
      return _get(obj[prop], properties, originalObj);
    }
  }

  return _get(obj, properties, obj);
}

/**
 * Returns true, if the given object contains a property with the given name. 
 * @param {Object} obj 
 * @param {String} prop 
 * @returns {Boolean} True, if the given object has a property with the given name. 
 */
export function hasProperty(obj, prop) {
  return prop in obj;
}