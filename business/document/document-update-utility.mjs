import * as PropUtil from "../util/property-utility.mjs";
import { isFunction, isObject, isArray } from "../util/validation-utility.mjs";

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
  const propertyNames = PropUtil.splitPropertyPath(propertyPath);
  // This is the data transfer object (DTO) that is sent to the server. 
  let dto = {}; // This object **must** be based on 'Object' and not 'null', as otherwise FoundryVTT's merge utility will fail!

  // Commence building the DTO. 
  const lastPropertyNameOfPath = propertyNames[propertyNames.length - 1];
  let dtoProperty = dto;
  let lastDtoPropertyParentProperty = undefined;
  let documentProperty = document;
  for (const propertyName of propertyNames) {
    documentProperty = documentProperty[propertyName];

    if (isFunction(documentProperty)) {
      throw new Error("Detected a function as part of a given property path - functions cannot be persisted!");
    } else if (isObject(documentProperty) === true) {
      dtoProperty[propertyName] = {}; // This object **must** be based on 'Object' and not 'null', as otherwise FoundryVTT's merge utility will fail!
    } else if(isArray(documentProperty) === true) {
      game.ambersteel.logger.logWarn("Detected array as part of given property path - consider converting the array to an object, instead, as arrays are very slow to process");
      dtoProperty[propertyName] = documentProperty;
    } else { // Not an object or array, so surely it's a primitive?
      if (propertyName !== lastPropertyNameOfPath) {
        throw new Error("Detected a primitive as part of a given property path - property paths may not contain primitives, only end on them!");
      }
    }

    // If this is the final iteration, make sure to keep a reference to the property that is parent to the final property. 
    if (propertyName === lastPropertyNameOfPath) {
      lastDtoPropertyParentProperty = dtoProperty;
    }

    dtoProperty = dtoProperty[propertyName];
  }
  lastDtoPropertyParentProperty[lastPropertyNameOfPath] = newValue;

  // FoundryVTT assumes that the data sent is based on `document.data`, meaning that the dto being sent 
  // **must not** contain a nested `data` property. 
  dto = unnestData(dto);

  await document.update(dto, { render: render });
}

/**
 * If the given object contains a `data` property nested in another property of the same name, 
 * removes the first `data` and returns a new object without the nested properties. 
 * @param {Object} dto 
 * @returns {Object}
 */
export function unnestData(dto) {
  if (dto.data !== undefined && dto.data.data !== undefined) {
    const newDto = {}; // This object **must** be based on 'Object' and not 'null', as otherwise FoundryVTT's merge utility will fail!
    newDto.data = dto.data.data;
    return newDto;
  } else {
    return dto;
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
