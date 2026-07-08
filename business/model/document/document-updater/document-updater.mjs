import { common } from "../../../../common/_module.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";

/**
 * Utility for updating a document's data. 
 */
export default class DocumentUpdater {
  /**
   * @type {Object}
   * @private
   */
  get _logger() { return game.strive.logger; }

  /**
   * If `true`, field updates do not immediately fire and get 
   * persisted, but are instead collected and aggregated, to be flushed via a `flushUpdates()` call. 
   * 
   * Setting this to `false` immediately flushes all updates. 
   * @type {Boolean}
   * @private
   */
  #isTransactionMode = false;
  get isTransactionMode() { return this.#isTransactionMode; }
  set isTransactionMode(value) {
    this.#isTransactionMode = value;
    if (!value) {
      this.flushUpdates();
    }
  }

  /**
   * Holds all currently outstanding updates. 
   * @type {Object}
   * @private
   */
  #transactions = {};

  constructor(document) {
    if (!ValidationUtil.isDefined(document)) {
      throw new Error("document must be defined");
    }

    this.document = document;
  }

  /**
   * Updates the document with the given `delta` object. 
   * 
   * @param {Object} delta The update delta to persist. 
   * @param {Boolean} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async update(delta, render = true) {
    if (this.isTransactionMode) {
      this.#transactions = {
        ...this.#transactions,
        ...delta,
      };
    } else {
      this.document.update(delta, { render: render, });
    }
  }

  /**
   * Updates a property on the document, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the document. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: `"system.attributes[0].level"`
   *        E.g.: `"system.attributes[4]" `
   *        E.g.: `"system.attributes" `
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * default `true`. 
   * 
   * @async
   */
  async updateByPath(propertyPath, newValue, render = true) {
    const dto = this._buildDto(propertyPath, newValue);
    if (this.isTransactionMode) {
      this.#transactions = {
        ...this.#transactions,
        ...dto,
      };
    } else {
      await this.document.update(dto, { render: render });
    }
  }
  
  /**
   * Deletes a property on the document, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to delete, on the document. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level"`
   * * E.g.: `"system.attributes[4]"`
   * * E.g.: `"system.attributes"`
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * default `true`. 
   * 
   * @async
   */
  async deleteByPath(propertyPath, render = true) {
    if (propertyPath.endsWith("]")) { // Delete item from array.
      const indexBracket = propertyPath.lastIndexOf("[");
      const indexLastBracket = propertyPath.length - 1;
      const arrayPropertyPath = propertyPath.substring(0, indexBracket);
      
      let array = common.util.property.getNestedPropertyValue(this.document, arrayPropertyPath);
      const index = parseInt(propertyPath.substring(indexBracket + 1, indexLastBracket));
      array = array.slice(0, index).concat(array.slice(index + 1));

      await this.updateByPath(arrayPropertyPath, array, render);
    } else { // Delete property from object. 
      const parts = propertyPath.split(/\./g);

      // Adjust the last property in the path. '-=' must be prepended to it. 
      // The '-=' is what makes FoundryVTT actually delete the property. 
      parts[parts.length - 1] = `-=${parts[parts.length - 1]}`;
      const parentPropertyPath = parts.join(".");

      // Null must be given as the value for a property to be deleted. 
      // Undefined wouldn't work, as undefined properties are simply skipped by FoundryVTT.
      await this.updateByPath(parentPropertyPath, null, render);
    }
  }

  /**
   * Persists all currently outstanding updates to the data base. 
   */
  flushUpdates() {
    this.document.update(this.#transactions, { render: true, });
    this.discardUpdates();  
  }

  /**
   * Clears the current updates buffer. 
   */
  discardUpdates() {
    this.#transactions = {};
  }

  /**
   * Returns a data transfer object (dto), based on the document and given property path, 
   * with the given value applied. 
   * 
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
  _buildDto(propertyPath, newValue) {
    if (propertyPath === undefined || propertyPath.trim().length < 1) {
      throw new Error(`Invalid property path '${propertyPath}'`);
    }
    
    const propertyNames = common.util.property.splitPropertyPath(propertyPath);
    
    if (propertyNames.length < 1) {
      throw new Error(`Invalid property path '${propertyPath}'`);
    }

    if (common.util.validation.isArray(newValue) === true) {
      this._logger.logWarn(`Detected array as the value to set - consider converting the array to an object, instead, as arrays are slow to process`);
    } else if (common.util.validation.isFunction(newValue) === true) {
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
    let previousDocumentProperty = this.document;
    // If this value is true, then an array is part of the property path. 
    // In such a case, we can no longer create small delta objects and have to instead start 
    // taking whole objects. Otherwise, all but the targeted property could be lost. 
    let arrayIsPartOfPath = false;

    // Iterate once for every property name in the path. 
    for (let i = 0; i < propertyNames.length; i++) {
      const propertyName = propertyNames[i];

      if (common.util.validation.isDefined(previousDocumentProperty[propertyName])) {
        const currentDocumentProperty = previousDocumentProperty[propertyName];
  
        if (common.util.validation.isFunction(currentDocumentProperty) === true) {
          throw new Error(`Detected a function as part by name '${propertyName}' of a given property path '${propertyPath}' - functions cannot be persisted!`);
        } else if (common.util.validation.isArray(currentDocumentProperty) === true) {
          arrayIsPartOfPath = true;
          this._logger.logWarn(`Detected array as part by name '${propertyName}' of given property path '${propertyPath}' - consider converting the array to an object, instead, as arrays are slow to process`);
          previousDtoProperty[propertyName] = currentDocumentProperty;
        } else if (common.util.validation.isObject(currentDocumentProperty) === true) {
          if (arrayIsPartOfPath === true) {
            // Because differential updates to array elements are not possible, 
            // we must get the whole object from the document. 
            previousDtoProperty[propertyName] = currentDocumentProperty;
          } else {
            // This object **must** be based on 'Object' and not 'null', as otherwise FoundryVTT's merge utility will fail!
            previousDtoProperty[propertyName] = {};
          }
        } else {
          // Not an object, function or array, so surely it's a primitive?
          // A primitive is good as the last part of the path, but illegal within a path. 
          throw new Error(`Detected a primitive as part by name '${propertyName}' of a given property path '${propertyPath}' - property paths may not contain primitives, only end on them!`);
        }

        // Keep references to the currently looked at properties until the end of the next iteration. 
        previousDtoProperty = previousDtoProperty[propertyName];
        previousDocumentProperty = previousDocumentProperty[propertyName];
      } else {
        // The original object to build the DTO from is missing a piece of the path!
        // From this point on, the original object can no longer be used to determine elements of the path. 

        this._logger.logWarn("Substituting missing object in path");
        // This object **must** be based on 'Object' and not 'null', as otherwise FoundryVTT's merge utility will fail!
        previousDtoProperty[propertyName] = {};

        // The substituted object is now the effective last property. 
        previousDtoProperty = previousDtoProperty[propertyName];
        previousDocumentProperty = previousDtoProperty;
      }
    }

    // Finally, assign the new value. 
    previousDtoProperty[finalPropertyName] = newValue;

    return dto;
  }
}