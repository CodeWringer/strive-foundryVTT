import { validateOrThrow, isFunction, isObject, isArray } from "../../util/validation-utility.mjs";

/**
 * Allows updating a document's data. 
 */
export default class DocumentUpdater {
  /**
   * A logger instance. 
   * 
   * @type {BaseLoggingStrategy}
   * @private
   */
  _logger;

  /**
   * Property utility. 
   * 
   * @type {Object | Any}
   * @private
   */
  _propertyUtility;

  /**
   * @param {Object} args 
   * @param {Object} args.propertyUtility A named import "instance" of the `property-utility.mjs`. 
   * @param {BaseLoggingStrategy | undefined} args.logger A logger instance. 
   * * Default `game.strive.logger`. 
   * 
   * @throws If `args.propertyUtility` is undefined. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["propertyUtility"]);

    this._propertyUtility = args.propertyUtility;
    this._logger = args.logger ?? game.strive.logger;
  }

  /**
   * Updates a property on the given document entity, identified via the given path. 
   * 
   * @param {Actor|Item} document An Actor or Item document. 
   * @param {String} propertyPath Path leading to the property to update, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "system.attributes[0].level"
   *        E.g.: "system.attributes[4]" 
   *        E.g.: "system.attributes" 
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * 
   * @async
   */
  async updateByPath(document, propertyPath, newValue, render = true) {
    const dto = this._buildDto(document, propertyPath, newValue);
    await document.update(dto, { render: render });
  }
  
  /**
   * Deletes a property on the given document, via the given path. 
   * @param {Actor | Item} document An Actor or Item document. 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level"`
   * * E.g.: `"system.attributes[4]"`
   * * E.g.: `"system.attributes"`
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. Default 'true'. 
   * @async
   */
  async deleteByPath(document, propertyPath, render = true) {
    if (propertyPath.endsWith("]")) { // Delete item from array.
      const indexBracket = propertyPath.lastIndexOf("[");
      const indexLastBracket = propertyPath.length - 1;
      const arrayPropertyPath = propertyPath.substring(0, indexBracket);
      
      let array = this._propertyUtility.getNestedPropertyValue(document, arrayPropertyPath);
      const index = parseInt(propertyPath.substring(indexBracket + 1, indexLastBracket));
      array = array.slice(0, index).concat(array.slice(index + 1));

      await this.updateByPath(document, arrayPropertyPath, array, render);
    } else { // Delete property from object. 
      const parts = propertyPath.split(/\./g);

      // Adjust the last property in the path. '-=' must be prepended to it. 
      // The '-=' is what makes FoundryVTT actually delete the property. 
      parts[parts.length - 1] = `-=${parts[parts.length - 1]}`;
      const parentPropertyPath = parts.join(".");

      // Null must be given as the value for a property to be deleted. 
      // Undefined wouldn't work, as undefined properties are simply skipped by FoundryVTT.
      await this.updateByPath(document, parentPropertyPath, null, render);
    }
  }

  /**
   * Returns a data transfer object (dto), based on the given document and property path, 
   * with the given value applied. 
   * 
   * @param {Actor | Item} document An Actor or Item document. 
   * @param {String} propertyPath Path leading to the property to update, on the given document entity. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level"`
   * * E.g.: `"system.attributes[4]"`
   * * E.g.: `"system.attributes"`
   * @param {any} newValue The value to assign to the property. 
   * 
   * @returns {Object} An "update delta" object. This is a dto to send to the data base. 
   * 
   * @throws If an invalid or blank property path is provided. 
   * @throws If a function is part or the end of the property path. 
   * @throws If a primitive is part of the property path. 
   * 
   * @private
   */
  _buildDto(document, propertyPath, newValue) {
    if (propertyPath === undefined || propertyPath.trim().length < 1) {
      throw new Error(`Invalid property path '${propertyPath}'`);
    }
    
    const propertyNames = this._propertyUtility.splitPropertyPath(propertyPath);
    
    if (propertyNames.length < 1) {
      throw new Error(`Invalid property path '${propertyPath}'`);
    }

    if (isArray(newValue) === true) {
      this._logger.logWarn(`Detected array as the value to set - consider converting the array to an object, instead, as arrays are slow to process`);
    } else if (isFunction(newValue) === true) {
      throw new Error("Detected a function as the value to set - functions cannot be persisted!");
    }

    // This is the data transfer object (DTO) that is sent to the server. 
    // This object **must** be based on 'Object' and not 'null', as otherwise FoundryVTT's merge utility will fail!
    // All this means is that `Object.create(null)` would cause errors. 
    const dto = {};

    // Commence building the DTO. 

    // The last property name in the path. 
    const finalPropertyName = propertyNames.pop();
    // A reference to the previously looked at property. 
    // Initially, this is a reference to the dto itself. 
    let previousDtoProperty = dto;
    // A reference to the previously looked at property, on the document. 
    // Initially, this is a reference to the document itself. 
    let previousDocumentProperty = document;
    // If this value is true, then an array is part of the property path. 
    // In such a case, we can no longer create small delta objects and have to instead start 
    // taking whole objects. Otherwise, all but the targeted property could be lost. 
    let arrayIsPartOfPath = false;

    // Iterate once for every property name in the path. 
    for (let i = 0; i < propertyNames.length; i++) {
      const propertyName = propertyNames[i];
      const currentDocumentProperty = previousDocumentProperty[propertyName];

      if (isFunction(currentDocumentProperty) === true) {
        throw new Error(`Detected a function as part by name '${propertyName}' of a given property path '${propertyPath}' - functions cannot be persisted!`);
      } else if (isArray(currentDocumentProperty) === true) {
        arrayIsPartOfPath = true;
        this._logger.logWarn(`Detected array as part by name '${propertyName}' of given property path '${propertyPath}' - consider converting the array to an object, instead, as arrays are slow to process`);
        previousDtoProperty[propertyName] = currentDocumentProperty;
      } else if (isObject(currentDocumentProperty) === true) {
        if (arrayIsPartOfPath === true) {
          // Because differential updates to array elements are not possible, 
          // we must get the whole object from the document. 
          previousDtoProperty[propertyName] = currentDocumentProperty;
        } else {
          // This object **must** be based on 'Object' and not 'null', as otherwise FoundryVTT's merge utility will fail!
          previousDtoProperty[propertyName] = {};
        }
      } else if (currentDocumentProperty === undefined) {
        this._logger.logWarn("Substituting missing object in path");
        // This object **must** be based on 'Object' and not 'null', as otherwise FoundryVTT's merge utility will fail!
        previousDtoProperty[propertyName] = {};
      } else {
        // Not an object, function or array, so surely it's a primitive?
        // A primitive is good as the last part of the path, but illegal within a path. 
        throw new Error(`Detected a primitive as part by name '${propertyName}' of a given property path '${propertyPath}' - property paths may not contain primitives, only end on them!`);
      }

      // Keep references to the currently looked at properties until the end of the next iteration. 
      previousDtoProperty = previousDtoProperty[propertyName];
      previousDocumentProperty = previousDocumentProperty[propertyName];
    }

    // Finally, assign the new value. 
    previousDtoProperty[finalPropertyName] = newValue;

    return dto;
  }
}