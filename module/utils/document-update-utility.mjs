import { getNestedPropertyValue } from "./property-utility.mjs";

/**
 * Updates a property on the given document entity, identified via the given path. 
 * @param {Actor|Item} document An Actor or Item document. 
 * @param {String} propertyPath Path leading to the property to update, on the given document entity. 
 *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
 *        E.g.: "data.attributes[0].value"
 *        E.g.: "data.attributes[4]" 
 *        E.g.: "data.attributes" 
 * @param {any} newValue The value to assign to the property. 
 * @async
 * @protected
 */
export async function updateProperty(document,  propertyPath, newValue) {
  const parts = propertyPath.split(/\.|\[/g);
  const lastPart = parts[parts.length - 1].replace("]", "");

  if (parts.length == 1) {
    // example:
    // obj = { a: { b: [{c: 42}] } }
    // path: "a"
    await document.update({ [propertyPath]: newValue });
  } else {
    // example:
    // obj = { a: { b: [{c: 42}] } }
    // path: "a.b[0].c"
    let prop = undefined;
    const dataDelta = document.data[parts.shift()];

    for (let part of parts) {
      part = part.replace("]", "");

      if (part == lastPart) {
        prop ? prop[part] = newValue : dataDelta[part] = newValue;
      } else {
        prop = prop ? prop[part] : dataDelta[part];
      }
    }
    await document.update({ data: dataDelta });
  }
}

/**
 * 
 * @param {Actor|Item} document An Actor or Item document. 
 * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
 *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
 *        E.g.: "data.attributes[0].value" 
 *        E.g.: "data.attributes[4]" 
 *        E.g.: "data.attributes" 
 */
export async function deleteByPropertyPath(document, propertyPath) {
  if (propertyPath.endsWith("]")) { // Delete item from array.
    const indexBracket = propertyPath.lastIndexOf("[");
    const indexLastBracket = propertyPath.length - 1;
    const arrayPropertyPath = propertyPath.substring(0, indexBracket);
    
    let array = getNestedPropertyValue(document, arrayPropertyPath);
    const index = parseInt(propertyPath.substring(indexBracket + 1, indexLastBracket));
    array = array.slice(0, index).concat(array.slice(index + 1));

    await updateProperty(document, arrayPropertyPath, array);
  } else { // Delete property from object. 
    let parts = propertyPath.split(/\./g);
    const propName = parts[parts.length - 1];
    parts = parts.slice(0, parts.length - 1);
    const parentPropertyPath = parts.join(".");
    
    if (parts.length == 0) { // Delete property on document itself. 
      throw `Not implemented!`; // TODO: Is this even possible?
    } else { // Delete property on property of document. 
      const propertyParent = getNestedPropertyValue(document, parentPropertyPath);
      delete propertyParent[propName];
      await updateProperty(document, parentPropertyPath, propertyParent);
    }
  }
}