import { ValidationUtil } from "./validation-utility.mjs";

/**
 * @constant
 */
export const PropertyUtil = {
	/**
	 * Internal function that does the actual look-up of nested property values. 
	 * 
	 * @param {Object} obj The object whose value is to be looked-up. 
	 * @param {Array<String>} properties The broken down property path. 
	 * Each element represents one property's name in the path. 
	 * 
	 * @private
	 */
	_get: function(obj, properties) {
		if (!ValidationUtil.isArray(properties) || properties.length === 0) return obj;
	
		const prop = properties.shift();
		if (this.hasProperty(obj, prop) !== true && Array.isArray(obj) !== true) {
			return undefined;
		} else {
			return this._get(obj[prop], properties);
		}
	},
	
	/**
	 * Breaks down the given property path (e. g. "a.b[4].c") into an array of its elements (e. g. ["a", "b", 4, "c"]) 
	 * and returns that array. 
	 * 
	 * @param {String} propertyPath A property path to break down. 
	 * 
	 * @returns {Array<String | Number>} An array of separated property path elements. 
	 * 
	 * @private
	 */
	splitPropertyPath: function(propertyPath) {
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
	},
	
	/**
	 * Returns the value of a nested property. 
	 * 
	 * Supports array-access-notation. Does not support accessing properties via '[<propName>]'.
	 * 
	 * @param {Object} obj The object whose nested property is to be returned. 
	 * @param {String} path The property path. 
	 *        Separate properties with dot-notation. 
	 *        Access arrays with bracket-notation. 
	 *        E. g. "expertises[4].name"
	 * 
	 * @returns {Any} If the property in question is an object, returns that object, 
	 * otherwise, returns the value of the property. 
	 */
	getByPath: function(obj, path) {
		const propertyPath = this.splitPropertyPath(path);
	
		return this._get(obj, propertyPath);
	},
	
	/**
	 * Sets the value of a nested property. 
	 * 
	 * Will substitute missing steps in the path, but only for object intermediates. 
	 * Substituting arrays is not supported! 
	 * 
	 * @param {Object} obj The object whose nested property is to be returned. 
	 * @param {String} path The property path. Supports array-access-notation. 
	 * Does not support accessing properties via '[<propName>]'.
	 * * Separate properties with dot-notation. 
	 * * Access arrays with bracket-notation. 
	 * * E. g. "expertises[4].name"
	 * @param {Any} value The value to set. 
	 * 
	 * @throws {Error} If the given path doesn't resolve to a property. 
	 */
	setByPath: function(obj, path, value) {
		const propertyPath = this.splitPropertyPath(path);
		const propertyToSet = propertyPath.pop();
	
		if (!ValidationUtil.isDefined(propertyToSet)) {
			throw new Error("'path' is empty");
		}
		if (!ValidationUtil.isDefined(obj) || !ValidationUtil.isObject(obj)) {
			throw new Error("'obj' is undefined");
		}

		// For debugging purposes. 
		let pathUntilNow = propertyPath[0];

		// Traverse the path, either grabbing the next property in the path, or substituting 
		// missing steps as empty objects or arrays. 
		let previousProperty = obj;
		for (let i = 0; i < propertyPath.length; i++) {
			const propertyName = propertyPath[i];
			const property = previousProperty[propertyName];

			if (propertyName !== propertyPath[0]) {
				pathUntilNow = `${pathUntilNow}.${propertyName}`;
			}

			if (ValidationUtil.isDefined(property)) {
				previousProperty = property;
			} else if (ValidationUtil.isObject(previousProperty)) {
				previousProperty[propertyName] = {};
				previousProperty = previousProperty[propertyName];
			} else {
				throw new Error(`Failed to set property at '${path}'; Cannot substitute path at '${pathUntilNow}'`);
			}
		}
		// Finally, set the value that was actually desired. 
		previousProperty[propertyToSet] = value;
	},
	
	/**
	 * Deletes a nested property. 
	 * 
	 * Supports array-access-notation. Does not support accessing properties via '[<propName>]'.
	 * 
	 * @param {Object} obj The object whose nested property is to be deleted. 
	 * @param {String} path The property path. 
	 *        Separate properties with dot-notation. 
	 *        Access arrays with bracket-notation. 
	 *        E. g. "expertises[4].name"
	 * 
	 * @throws {Error} If the given path doesn't resolve to a property. 
	 * @throws {Error} If deleting the property failed. 
	 */
	deleteNestedProperty: function(obj, path) {
		const propertyPath = this.splitPropertyPath(path);
		const propertyToDelete = propertyPath.pop();
	
		if (propertyToDelete === undefined) {
			throw new Error(`Failed to delete property at '${path}'!`);
		}
	
		const propertyOwner = this._get(obj, propertyPath);
		if (ValidationUtil.isDefined(propertyOwner)) {
			delete propertyOwner[propertyToSet];
		} else {
			throw new Error(`Failed to delete nested property: { path: ${path} }`);
		}
	},
	
	/**
	 * Returns true, if the given object contains a property with the given name. 
	 * 
	 * @param {Object} obj The object to be tested. 
	 * @param {String} prop Name of a property. 
	 * 
	 * @returns {Boolean} True, if the given object has a property with the given name. 
	 */
	hasProperty: function(obj, prop) {
		if (ValidationUtil.isObject(obj) || ValidationUtil.isArray(obj)) {
			return prop in obj;
		} else {
			return false;
		}
	},
	
	/**
	 * Ensures a nested property at the given path exists. 
	 * 
	 * Will create new properties of type object on the given object, as necessary. 
	 * 
	 * Sets the last property's value to the given value. 
	 * 
	 * @param {Object} obj The object whose nested property is to be ensured. 
	 * @param {String} propertyPath The property path. 
	 *        Separate properties with dot-notation. 
	 *        Access arrays with bracket-notation. 
	 *        E. g. "expertises[4].name"
	 * @param {Any} value The value to set, if it isn't already defined. 
	 */
	ensureNestedProperty: function(obj, propertyPath, value) {
		const pathElements = this.splitPropertyPath(propertyPath);
		const lastElement = pathElements.pop();
	
		let currentObject = obj;
		for (const pathElement of pathElements) {
			if (currentObject[pathElement] === undefined) {
				currentObject[pathElement] = {}
			}
			currentObject = currentObject[pathElement];
		}
	
		if (currentObject[lastElement] === undefined) {
			currentObject[lastElement] = value;
		}
	},

	/**
	 * If the given reference is an object, returns it as-is. Else returns 
	 * a new blank object. 
	 * 
	 * @param {Any} candidate
	 *  
	 * @returns {Object}
	 */
	guaranteeObject(candidate) {
		if (ValidationUtil.isObject(candidate)) {
			return candidate;
		} else {
			return {};
		}
	},
}
