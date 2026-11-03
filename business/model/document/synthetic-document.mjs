import { PropertyUtil } from "../../../common/util/property-utility.mjs";
import { UuidUtil } from "../../../common/util/uuid-utility.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import AuthenticDocument from "./authentic-document.mjs";
import DataFieldBridge from "./data-bridge/data-field-bridge.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs";
import Document from "./document.mjs";

/**
 * Represents the abstract base class for all embedded documents. These aren't - from FoundryVTT's point of view - real 
 * documents. They have no independent data-model equivalent, and are instead represented by custom data-fields, 
 * as properties of other, 'real' documents. 
 * 
 * @abstract Inheritors MUST implement: 
 * * `static fromDto()`
 * * `get clazz`
 * * `get type`
 * * `openSheet()`
 * * `toDto()`
 * 
 * @property {String} img
 * @property {String} name
 * @property {String} description
 * @property {String | null} gmNotes
 */
export default class SyntheticDocument extends Document {
  /**
   * Returns an instance of this class, converted from the given `dto`. 
   * @param {Object} dto Plain data transfer object (dto) as retrieved from db. 
   * @param {Object | undefined} args Additional, optional arguments for the conversion. 
   * @param {Object} args.parentDocument FoundryVTT document. 
   * @param {String} args.pathOnParent Data path on the `parentDocument` which can 
   * uniquely identify this instance. E.g. `"system.expertises.abc123"`
   * @param {String | undefined} args.id Unique ID of this instance. 
   * @returns {SyntheticDocument}
   * 
   * @abstract
   * @static
   */
  static fromDto(dto, args = {}) { throw new Error("Not implemented"); }

  /** @override */
  get clazz() { return SyntheticDocument; }

  /**
   * @type {String}
   * @private
   */
  #id;
  /** @override */
  get id() { return this.#id; }

  /** @override */
  get pack() { return this.#parentDocument.pack; }

  /** @override */
  get isOwner() { return this.#parentDocument.isOwner ?? this.#parentDocument.owner ?? false; }

  /** @override */
  get isEmbedded() { return true; }

  /** @override */
  get isLocked() { return ValidationUtil.isDefined(this.#parentDocument.pack) && this.#parentDocument.pack.metadata.locked; }

  /** @override */
  get parentDocument() { return this.#parentDocument; }

  /** 
   * @summary
   * Serves as an accessor to the raw data of the synthetic document. 
   * 
   * @description
   * This is a hack for most of the API 
   * expecting authentic document accessing to work, i.e. `"system.a.b.c"`. However, a synthetic document 
   * doesn't natively possess a `system` property. All its data is stored directly within it, without such 
   * an additional nesting layer. 
   * @override
   */
  get system() { return this.#raw; }

  /**
   * The icon/image path of the document. 
   * 
   * @type {String}
   */
  get img() { return this._img.value; }
  set img(value) { this._img.value = value; }

  /**
   * The internal name of the document. 
   * 
   * @type {String}
   */
  get name() { return this._name.value; }
  set name(value) { this._name.value = value; }

  /**
   * @type {String}
   */
  get description() { return this._description.value; }
  set description(value) { this._description.value = value; }

  /**
   * Arbitrary notes only visible to game-masters. 
   * 
   * @type {String | null}
   */
  get gmNotes() { return this._gmNotes.value; }
  set gmNotes(value) { this._gmNotes.value = value; }

  /**
   * Raw data object. 
   * @type {Object}
   * @private
   */
  #raw;

  /**
   * The `AuthenticDocument` this synthetic one is embedded in. 
   * @type {AuthenticDocument}
   * @private
   */
  #parentDocument;

  /**
   * Data path on the `parentDocument` which can 
   * uniquely identify this instance. E.g. `"system.expertises.abc123"`
   * @type {String}
   * @private
   */
  #pathOnParent;

  /**
   * Returns the property path identifying the collection that contains this document instance. 
   * @type {String}
   * @readonly
   */
  get #collectionPath() {
    const mIndex = this.#pathOnParent.match(/\[\d+\]$/);
    if (ValidationUtil.isDefined(mIndex)) { // Part of an array. 
      return this.#pathOnParent.substring(0, mIndex.index);
    } else { // Probably part of an object. 
      const path = this.#pathOnParent.split(".");
      path.pop();
      return path.join(".");
    }
  }

  /**
   * @param {Object} args 
   * @param {Object} args.parentDocument FoundryVTT document. 
   * @param {String} args.pathOnParent Data path on the `parentDocument` which can 
   * uniquely identify this instance. E.g. `"system.expertises.abc123"`
   * @param {Object | undefined} args.raw Raw data object. 
   * @param {String | undefined} args.id Unique ID of this instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      updater: new DocumentUpdater(args.parentDocument),
    });
    ValidationUtil.validateOrThrow(args, ["parentDocument", "pathOnParent"]);

    this.#raw = args.raw ?? {};
    this.#parentDocument = args.parentDocument.getEnhancedDocument();
    this.#pathOnParent = args.pathOnParent;
    this.#id = args.id ?? UuidUtil.createUuid();

    this._img = new DataFieldBridge({
      document: this,
      dataPath: "system.img",
      onChange: (newValue, oldValue) => {
        this._onChangeCallbacks.invoke("img", newValue, oldValue);
      },
    });
    this._name = new DataFieldBridge({
      document: this,
      dataPath: "system.name",
      default: "Unknown",
      onChange: (newValue, oldValue) => {
        this._onChangeCallbacks.invoke("name", newValue, oldValue);
      },
    });
    this._description = new DataFieldBridge({
      document: this,
      dataPath: "system.description",
      default: "",
      onChange: (newValue, oldValue) => {
        this._onChangeCallbacks.invoke("description", newValue, oldValue);
      },
    });
    this._gmNotes = new DataFieldBridge({
      document: this,
      dataPath: "system.gmNotes",
      default: "",
      fromDto: (dto) => {
        if (ValidationUtil.isBlankOrUndefined(dto)) {
          return null;
        } else {
          return dto;
        }
      },
      toDto: (value) => {
        if (ValidationUtil.isBlankOrUndefined(value)) {
          return null;
        } else {
          return value;
        }
      },
      onChange: (newValue, oldValue) => {
        this._onChangeCallbacks.invoke("gmNotes", newValue, oldValue);
      },
    });
  }

  /** @override */
  async delete() {
    await this._updater.deleteByPath(this.#pathOnParent);
  }

  /** @override */
  async update(delta, render = true) {
    const collection = this.#getCollection();

    // Remove 'system' from the delta, if necessary. 
    // This is a hack as there is no 'system' property for this object on the parent document. 
    // Instead, all the properties therein are flattened into the delta object. 
    let newDelta = {
      ...delta,
    };
    if (ValidationUtil.isDefined(delta.system)) {
      newDelta = {
        ...delta,
        ...delta.system,
      };
      delete delta.system;
    }
    const dto = {
      ...this.#raw,
      ...newDelta,
    };

    if (ValidationUtil.isArray(collection)) {
      const newCollection = collection.concat([]);
      const index = newCollection.findIndex(it => it.id === this.id);
      if (index < 0) {
        game.strive.logger.warning("Failed to find index");
        return;
      }

      newCollection[index] = dto;
      if (!this.isBufferMode) {
        PropertyUtil.setByPath(this.#parentDocument, this.#collectionPath, newCollection);
      }
      this._updater.updateByPath(this.#collectionPath, newCollection, render);
    } else if (ValidationUtil.isObject(collection)) {
      if (!this.isBufferMode) {
        PropertyUtil.setByPath(this.#parentDocument, this.#pathOnParent, dto);
      }
      this._updater.updateByPath(this.#pathOnParent, dto, render);
    } else {
      game.strive.logger.error("Failed to get parent collection or parent collection is of unsupported type");
      return;
    }
  }

  /** @override */
  async updateByPath(propertyPath, newValue, render = true) {
    let correctedPath = propertyPath;
    const systemPrefix = "system.";
    if (propertyPath.startsWith(systemPrefix)) {
      correctedPath = correctedPath.substring(systemPrefix.length);
    }
    const fullPath = `${this.#pathOnParent}.${correctedPath}`;
    if (!this.isBufferMode) {
      PropertyUtil.setByPath(this.#parentDocument, fullPath, newValue);
    }
    this._updater.updateByPath(fullPath, newValue, render);
  }

  /**
   * Returns a dto (= data transfer object) representation of this instance, 
   * which can be safely persisted to the data base. 
   * 
   * As such, it MUST contain only Objects and primitive data types. Under NO 
   * circumstance may it contain references to other objects, such as other document 
   * references!
   * 
   * @returns {Object}
   * @abstract
   */
  toDto() { throw new Error("Not implemented"); }

  /**
   * Returns the collection that contains this document instance. 
   * @returns {Array<SyntheticDocument> | Object}
   * @private
   */
  #getCollection() {
    return PropertyUtil.getByPath(this.#parentDocument, this.#collectionPath);
  }
}
