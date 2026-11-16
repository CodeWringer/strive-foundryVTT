import { PropertyUtil } from "../../../../common/util/property-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";

/**
 * Utility for updating a document's data. 
 * 
 * Buffers updates, to prevent them from being immediately being persisted, which would cause 
 * sheet re-rendering and interrupting the user's editing flow. Persisting to DB must be done via 
 * a `flushUpdates()` call. 
 */
export default class DocumentUpdater {
  /**
   * @type {Object}
   * @protected
   */
  get _logger() { return game.strive.logger; }

  /**
   * @type {Object}
   * @private
   */
  #buffer = {};
  /**
   * Returns all currently outstanding updates. 
   * @type {Object}
   */
  get buffer() { return this.#buffer; }
  /**
   * Sets all currently outstanding updates. 
   * @param {Object} value
   */
  set buffer(value) { this.#buffer = value; }

  /**
   * @type {Object}
   * @private
   */
  #document;
  /**
   * FoundryVTT document instance. 
   * @type {Object}
   * @protected
   */
  get _document() { return this.#document; };

  /**
   * @param {Object} args
   * @param {Object} args.document FoundryVTT document instance. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.#document = args.document;
  }

  /**
   * Updates the document with the given `delta` object. 
   * 
   * @param {Object} delta The update delta to persist. 
   * @param {Boolean} force If `true`, will bypass the buffer and immediately flush the update. 
   * * Default 'false'. 
   * 
   * @async
   */
  async update(delta, force = false) {
    this.buffer = FoundryWrapper.mergeObject(this.buffer, delta);
    if (force) {
      this.flushUpdates();
    }
  }
  
  /**
   * Updates the document with the given `delta` object. 
   * 
   * @param {Object} delta The update delta to persist. 
   * @param {Boolean} render If `true`, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   * @private
   */
  async #update(delta, render = true) {
    this._document.update(delta, { render: render, });
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
   * @param {Boolean | undefined} force If `true`, will bypass the buffer and immediately flush the update. 
   * * default `false`. 
   * 
   * @async
   */
  async updateByPath(propertyPath, newValue, force = false) {
    const dto = this._buildDto(propertyPath, newValue);
    await this.update(dto, force);
  }
  
  /**
   * Deletes a property on the document, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to delete, on the document. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level"`
   * * E.g.: `"system.attributes[4]"`
   * * E.g.: `"system.attributes"`
   * @param {Boolean | undefined} force If `true`, will bypass the buffer and immediately flush the update. 
   * * default `false`. 
   * 
   * @async
   */
  async deleteByPath(propertyPath, force = false) {
    const mIndex = propertyPath.match(/\[\d+\]$/);
    if (ValidationUtil.isDefined(mIndex)) { // Delete item from array.
      const arrayPropertyPath = propertyPath.substring(0, mIndex.index);
      
      let array = PropertyUtil.getByPath(this._document, arrayPropertyPath);
      const index = parseInt(mIndex[0].substring(1, mIndex[0].length - 1));
      array = array.slice(0, index).concat(array.slice(index + 1));

      await this.updateByPath(arrayPropertyPath, array, force);
    } else { // Delete property from object. 
      const parts = propertyPath.split(".");

      // Adjust the last property in the path. '-=' must be prepended to it. 
      // The '-=' is what makes FoundryVTT actually delete the property. 
      parts[parts.length - 1] = `-=${parts[parts.length - 1]}`;
      const parentPropertyPath = parts.join(".");

      // Null must be given as the value for a property to be deleted. 
      // Undefined wouldn't work, as undefined properties are simply skipped by FoundryVTT.
      await this.updateByPath(parentPropertyPath, null, force);
    }
  }

  /**
   * Persists all currently outstanding updates to the data base. 
   */
  flushUpdates() {
    this.#update(this.buffer, true);
    this.discardUpdates();  
  }

  /**
   * Clears the current updates buffer. 
   */
  discardUpdates() {
    this.#buffer = {};
  }

  /**
   * Returns the buffered value identified by the given property path, 
   * if it exists. 
   * @param {String} propertyPath Path leading to the property. 
   * * Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   * * E.g.: `"system.attributes[0].level"`
   * * E.g.: `"system.attributes[4]"`
   * * E.g.: `"system.attributes"`
   * @returns {Any | undefined}
   */
  getBufferByPath(propertyPath) {
    return PropertyUtil.getByPath(this.buffer, propertyPath);
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
   * @protected
   */
  _buildDto(propertyPath, newValue) {
    if (propertyPath === undefined || propertyPath.trim().length < 1) {
      throw new Error(`Invalid property path '${propertyPath}'`);
    }
    
    const propertyNames = PropertyUtil.splitPropertyPath(propertyPath);
    
    if (propertyNames.length < 1) {
      throw new Error(`Invalid property path '${propertyPath}'`);
    }

    if (ValidationUtil.isArray(newValue) === true && game.strive.debug === true) {
      this._logger.debug(`Detected array as the value to set - consider converting the array to an object, instead, as arrays are slow to process`);
    } else if (ValidationUtil.isFunction(newValue) === true) {
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
    let previousDocumentProperty = this._document;
    // If this value is true, then an array is part of the property path. 
    // In such a case, we can no longer create small delta objects and have to instead start 
    // taking whole objects. Otherwise, all but the targeted property could be lost. 
    let arrayIsPartOfPath = false;

    // Iterate once for every property name in the path. 
    for (let i = 0; i < propertyNames.length; i++) {
      const propertyName = propertyNames[i];

      if (ValidationUtil.isDefined(previousDocumentProperty[propertyName])) {
        const currentDocumentProperty = previousDocumentProperty[propertyName];
  
        if (ValidationUtil.isFunction(currentDocumentProperty) === true) {
          throw new Error(`Detected a function as part by name '${propertyName}' of a given property path '${propertyPath}' - functions cannot be persisted!`);
        } else if (ValidationUtil.isArray(currentDocumentProperty) === true) {
          arrayIsPartOfPath = true;
          previousDtoProperty[propertyName] = currentDocumentProperty.concat([]);
        } else if (ValidationUtil.isObject(currentDocumentProperty) === true) {
          if (arrayIsPartOfPath === true) {
            // Because differential updates to array elements are not possible, 
            // we must get the whole object from the document. 
            previousDtoProperty[propertyName] = FoundryWrapper.deepClone(currentDocumentProperty);
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

        this._logger.warning("Substituting missing object in path");
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