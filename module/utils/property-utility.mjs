/**
 * @param obj 
 * @param properties 
 * @private
 */
function _get(obj, properties) {
  if (!properties || properties.length === 0) return obj;

  const prop = properties.shift();
  if (hasProperty(obj, prop) !== true && Array.isArray(obj) !== true) {
		const msg = `Failed to get value of property at '${prop}'! Original context object:`;
		throw new Error(`InvalidStateException: ${msg}`);
  } else {
    return _get(obj[prop], properties);
  }
}

/**
 * Breaks down the given property path (e. g. "a.b[4].c") into an array of its elements (e. g. ["a", "b", 4, "c"]) 
 * and returns that array. 
 * @param {String} propertyPath A property path to break down. 
 * @returns {Array<String | Number>} An array of separated property path elements. 
 * @private
 */
export function splitPropertyPath(propertyPath) {
  let elements = propertyPath.split(/\.|\[/);
	const regexpInt = /\d+/;

	// Clean up elements of the property path. 
	for (let i = 0; i < elements.length; i++) {
		// This removes the brackets from an element. E. g. "[4]" -> "4"
		let element = elements[i].replace("[", "").replace("]", "");

		// Int type coercion, if possible. 
		const matchInt = element.match(regexpInt);
		if (matchInt !== null && matchInt[0].length === element.length) {
			element = parseInt(element);
		}

		// Override the existing element with the cleaned up version. 
		elements[i] = element;
	}

	return elements;
}

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
  const propertyPath = splitPropertyPath(path);

	try {
		return _get(obj, propertyPath);
	} catch(error) {
		throw new Error(`Failed to get nested property value: { path: ${path} }`, { cause: error });
	}
}

/**
 * Sets the value of a nested property. 
 * 
 * Supports array-access-notation. Does not support accessing properties via '[<propName>]'.
 * @param {Object} obj The object whose nested property is to be returned. 
 * @param {String} path The property path. 
 *        Separate properties with dot-notation. 
 *        Access arrays with bracket-notation. 
 *        E. g. "abilities[4].name"
 * @param {Any} value The value to set. 
 */
export function setNestedPropertyValue(obj, path, value) {
  const propertyPath = splitPropertyPath(path);
	const propertyToSet = propertyPath.pop();

	if (propertyToSet === undefined) {
		const msg = `Failed to set value of property at '${path}'! Original context object:`;
		throw new Error(`InvalidParameterException: ${msg}`);
	}

	try {
		const propertyOwner = _get(obj, propertyPath);
		propertyOwner[propertyToSet] = value;
	} catch (error) {
		throw new Error(`Failed to set nested property value: { path: ${path}, value: ${value} }`, { cause: error });
	}
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