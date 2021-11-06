/**
 * Updates a property on the given document entity, identified via the given path. 
 * @param {Actor|Item} document
 * @param {String} propertyPath Path leading to the property to update, on the given document entity. 
 *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
 *        E.g.: "data.attributes[0].value"
 * @param {any} newValue The value to assign to the property. 
 * @async
 * @protected
 */
export async function updateProperty(document,  propertyPath, newValue) {
  const parts = propertyPath.split(/\.|\[/);
  const lastPart = parts[parts.length - 1];

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