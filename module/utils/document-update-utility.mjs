import * as PropUtil from "./property-utility.mjs";
import * as ValUtil from "./validation-utility.mjs";

/**
 * Updates a property on the given document entity, identified via the given path. 
 * @param {Actor|Item} document An Actor or Item document. 
 * @param {String} propertyPath Path leading to the property to update, on the given document entity. 
 *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
 *        E.g.: "data.attributes[0].value"
 *        E.g.: "data.attributes[4]" 
 *        E.g.: "data.attributes" 
 * @param {any} newValue The value to assign to the property. 
 * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
 * @async
 */
export async function updateProperty(document, propertyPath, newValue, render = true) {
  const parts = PropUtil.splitPropertyPath(propertyPath);
  const lastPart = parts[parts.length - 1];

  if (parts.length == 1) {
    const updatePayload = { [propertyPath]: toDto(newValue) };
    await document.update(updatePayload, { render: render });
  } else {
    let prop = undefined;
    const dataDelta = toDto(document.data[parts.shift()]);

    for (let part of parts) {
      if (part == lastPart) {
        prop ? prop[part] = newValue : dataDelta[part] = newValue;
      } else {
        prop = prop ? prop[part] : dataDelta[part];
      }
    }
    const updatePayload = { data: dataDelta };
    await document.update(updatePayload, { render: render });
  }
}

/**
 * Deletes a property on the given document, via the given path. 
 * @param {Document} document A Foundry {Document}. 
 * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
 *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
 *        E.g.: "data.attributes[0].value" 
 *        E.g.: "data.attributes[4]" 
 *        E.g.: "data.attributes" 
 * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
 * @async
 */
export async function deleteByPropertyPath(document, propertyPath, render = true) {
  if (propertyPath.endsWith("]")) { // Delete item from array.
    const indexBracket = propertyPath.lastIndexOf("[");
    const indexLastBracket = propertyPath.length - 1;
    const arrayPropertyPath = propertyPath.substring(0, indexBracket);
    
    let array = PropUtil.getNestedPropertyValue(document, arrayPropertyPath);
    const index = parseInt(propertyPath.substring(indexBracket + 1, indexLastBracket));
    array = array.slice(0, index).concat(array.slice(index + 1));

    await updateProperty(document, arrayPropertyPath, array, render);
  } else { // Delete property from object. 
    const parts = propertyPath.split(/\./g);
    parts[parts.length - 1] = `-=${parts[parts.length - 1]}`; // The '-=' is what makes Foundry want to actually delete the property. 
    const parentPropertyPath = parts.join(".");

    await updateProperty(document, parentPropertyPath, null, render); // Null must be given as the value for a property to be deleted. 
  }
}

/**
 * @summary
 * Returns a plain object based on the given object instance. 
 * 
 * @description
 * The returned object is created as a deep copy of the given object and is intended to be 
 * understood as a data transfer object (DTO). This DTO is supposed to be sent over the 
 * wire, to persist to the DB. 
 * 
 * This function also recursively calls itself on all fields of the given object that are 
 * of type object. 
 * @param {Any} obj A complex object, an array (of complex objects) or a primitive value. 
 * @param {Array<String> | undefined} exclude Optional. An array of property names of fields to exclude. 
 * By default, "parent" is excluded. 
 * @returns {Object | Array<Any> | Any} Returns either a plain object, an array (of plain objects or 
 * primitive values) or a primitive value. 
 */
export function toDto(obj, exclude = ["parent"]) {
  // Special case of a function being passed returns as undefined. 
  // A function should **never** end up in a DTO! 
  if (ValUtil.isFunction(obj)) return undefined;

  // Recurse on array contents. 
  if (ValUtil.isArray(obj) === true) {
    const arr = [];
      for (const item of obj) {
        const itemDto = toDto(item);
        if (itemDto !== undefined) {
          arr.push(itemDto);
        }
      }
    return arr;
  }

  // Not an object, nor an array, results in immediate return. 
  // Do **not** recurse on non-objects or non-arrays!
  if (ValUtil.isObject(obj) !== true) return obj;

  // Check if the object in question implements its own logic to convert itself to a DTO. 
  if (obj.toDto !== undefined) {
    // Conversion is now the object's business. 
    return obj.toDto();
  } else {
    // Conversion will have to be done here. 

    const dto = {};
  
    // Recurse over every property of the given object. 
    for (const propertyName in obj) {
      // Skip any prototype properties. 
      if (obj.hasOwnProperty(propertyName) !== true) continue;

      if (exclude !== undefined) {
        if (exclude.find(it => { return it === propertyName; })) {
          continue;
        }
      }

      if (propertyName.toLowerCase().startsWith("parent") === true) {
        game.ambersteel.logger.logWarn(`Converting property '${propertyName}' to DTO, but name implies potential recursion?`);
      }

      const property = obj[propertyName];
      const propertyDto = toDto(property);

      if (propertyDto !== undefined) {
        dto[propertyName] = propertyDto;
      }
    }
  
    return dto;
  }
}
