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

  function _get(obj, properties) {
    if (!properties || properties.length === 0) return obj;

    const prop = properties.shift().replace("]", "");
    return _get(obj[prop], properties);
  }

  return _get(obj, properties);
}