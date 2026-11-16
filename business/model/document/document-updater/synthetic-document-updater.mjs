import { PropertyUtil } from "../../../../common/util/property-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import DocumentUpdater from "./document-updater.mjs";

/**
 * Utility for updating a document's data. 
 * 
 * @extends DocumentUpdater
 */
export default class SyntheticDocumentUpdater extends DocumentUpdater {
  /**
   * @type {String}
   * @private
   */
  #pathOnParent;

  /**
   * @type {Document}
   * @readonly
   * @private
   */
  get #parentDocument() { return this._document.getEnhancedDocument(); }

  /** @override */
  get buffer() { return this.#parentDocument._updater.buffer; }
  /** @override */
  set buffer(value) { this.#parentDocument._updater.buffer = value; }

  /**
   * @param {Object} args
   * @param {Object} args.parentDocument FoundryVTT document instance. 
   * @param {Object} args.pathOnParent Property path that identifies the document on the `parentDocument`. 
   */
  constructor(args = {}) {
    super({
      ...args,
      document: args.parentDocument,
    });
    ValidationUtil.validateOrThrow(args, ["parentDocument", "pathOnParent"]);

    this.#pathOnParent = args.pathOnParent;
  }

  /** @override */
  async update(delta, force = false) {
    // This check ensures updates are only fired when the delta actually differs from the 
    // current working data. 
    let hasChanges = false;
    for (const key in delta) {
      if (!Object.hasOwn(delta, key)) continue;

      hasChanges = true;
      break;
    }
    if (!hasChanges) return;

    // Remove 'system' from the delta, if necessary. 
    // This is a hack as there is no 'system' property for this object on the parent document. 
    // Instead, all the properties therein are flattened into the delta object. 
    let newDelta = {
      ...delta,
    };
    // Flatten `system` object, if necessary. 
    if (ValidationUtil.isDefined(delta.system)) {
      newDelta = {
        ...delta,
        ...delta.system,
      };
      newDelta.system = undefined;
      delete newDelta.system;
    }
    // Merge raw data with sanitized delta. This object will replace the whole object that represents 
    // 'our' document on the parent. That is why the entire object must be collected here, not just 
    // the delta. 
    const dto = {
      ...this.syntheticDocument.toDto(),
      ...newDelta,
    };

    const parentDto = this._buildDto(this.#pathOnParent, dto)
    await super.update(parentDto, force);
  }

  /** @override */
  async updateByPath(propertyPath, newValue, force = false) {
    const sanitizedPath = this.#sanitizePath(propertyPath);
    const dto = this._buildDto(sanitizedPath, newValue);
    await super.update(dto, force);
  }

  /**
   * Deletes the document instance. 
   * @returns {Promise<void>}
   * @async
   */
  async delete() {
    await this.deleteByPath(this.#pathOnParent);
  }

  /** @override */
  getBufferByPath(propertyPath) {
    const sanitizedPath = this.#sanitizePath(propertyPath);
    return super.getBufferByPath(`${this.#pathOnParent}.${sanitizedPath}`);
  }

  /** @override */
  _buildDto(propertyPath, newValue) {
    const dto = this.syntheticDocument.toDto();
    PropertyUtil.setByPath(dto, propertyPath, newValue);
    return super._buildDto(this.#pathOnParent, dto);
  }

  /**
   * Strips the `"system."` substring from the given `propertyPath`, and returns it. 
   * @param {String} propertyPath 
   * @returns {String}
   * @private
   */
  #sanitizePath(propertyPath) {
    const systemPrefix = "system.";
    if (propertyPath.startsWith(systemPrefix)) {
      return propertyPath.substring(systemPrefix.length);
    } else {
      return propertyPath;
    }
  }
}