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
   * @type {SyntheticDocument | undefined}
   */
  syntheticDocument;

  /**
   * @param {Object} args
   * @param {Boolean | undefined} args.isBufferMode If `true`, field updates do not immediately fire and get persisted, 
   * but are instead collected and aggregated, to be flushed via a `flushUpdates()` call. 
   * * default `false`
   * 
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
  async update(delta, render = true, force = false) {
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
    await super.update(parentDto, render, force);
  }

  /** @override */
  async updateByPath(propertyPath, newValue, render = true) {
    const systemPrefix = "system.";
    if (propertyPath.startsWith(systemPrefix)) {
      propertyPath = propertyPath.substring(systemPrefix.length);
    }
    const dto = this._buildDto(propertyPath, newValue);
    await super.update(dto, render);
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
  _buildDto(propertyPath, newValue) {
    const dto = this.syntheticDocument.toDto();
    PropertyUtil.setByPath(dto, propertyPath, newValue);
    return super._buildDto(this.#pathOnParent, dto);
  }
}