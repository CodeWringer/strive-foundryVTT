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
   * @param {Object} args 
   * @param {Object} args.parentDocument FoundryVTT document. 
   * @param {String} args.pathOnParent Data path on the `parentDocument` which can 
   * uniquely identify this instance. E.g. `"system.expertises.abc123"`
   * @param {String | undefined} args.id Unique ID of this instance. 
   */
  constructor(args = {}) {
    super({
      ...args,
      updater: new DocumentUpdater(args.parentDocument),
    });
    ValidationUtil.validateOrThrow(args, ["parentDocument", "pathOnParent"]);

    this.#parentDocument = args.parentDocument;
    this.#pathOnParent = args.pathOnParent;
    this.#id = args.id ?? UuidUtil.createUuid();

    this._img = new DataFieldBridge({
      document: this,
      dataPath: "img",
      onChange: (newValue, oldValue) => {
        this._onChangeCallbacks.invoke("img", newValue, oldValue);
      },
    });
    this._name = new DataFieldBridge({
      document: this,
      dataPath: "name",
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

  /**
   * Deletes this instance. 
   * 
   * @returns {Boolean} True, if the instance could be removed. 
   * @override
   */
  delete() {
    const collection = this.#getCollection();
    let newCollection;
    if (ValidationUtil.isArray(collection)) {
      newCollection = collection.concat([]);
      const index = newCollection.findIndex(it => it.id === this.id);
      if (index < 0) {
        game.strive.logger.warning("Failed to find index");
        return false;
      }

      newCollection.splice(index, 1);
      this.#setCollection(newCollection);
    } else if (ValidationUtil.isObject(collection)) {
      newCollection = {
        ...collection,
      };
      delete newCollection[this.id];

      this.#setCollection(newCollection);
    } else {
      game.strive.logger.error("Failed to get parent collection or parent collection is of unsupported type");
      return false;
    }

    return true;
  }

  /**
   * Updates the properties of this object, based on the given delta object. 
   * 
   * @param {Object} delta An object containing the properties of this object to update. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   * @override
   */
  async update(delta, render = true) {
    const collection = this.#getCollection();
    if (ValidationUtil.isArray(collection)) {
      const newCollection = collection.concat([]);
      const index = newCollection.findIndex(it => it.id === this.id);
      if (index < 0) {
        game.strive.logger.warning("Failed to find index");
        return;
      }
  
      newCollection[index] = {
        ...newCollection[index],
        ...delta,
      };
      this.#setCollection(newCollection);
    } else if (ValidationUtil.isObject(collection)) {
      newCollection = {
        ...collection,
      };
      newCollection[this.id] = {
        ...newCollection[this.id],
        ...delta,
      };
      this.#setCollection(newCollection);
    } else {
      game.strive.logger.error("Failed to get parent collection or parent collection is of unsupported type");
      return;
    }
  }

  /**
   * Updates a property of this Expertise on the parent item, identified via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to update, on the Expertise. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "itemOrders.b[0]"
   * @param {any} newValue The value to assign to the property. 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   * @override
   */
  async updateByPath(propertyPath, newValue, render = true) {
    if (propertyPath.startsWith(this.#pathOnParent)) {
      this.#parentDocument.updateByPath(propertyPath, newValue, render);
    } else {
      const newPath = `${this.#pathOnParent}.${propertyPath}`;
      this.#parentDocument.updateByPath(newPath, newValue, render);
    }
  }

  /**
   * Deletes a property on the expertise, via the given path. 
   * 
   * @param {String} propertyPath Path leading to the property to delete, on the given document entity. 
   *        Array-accessing via brackets is supported. Property-accessing via brackets is *not* supported. 
   *        E.g.: "system.attributes[0].level" 
   *        E.g.: "system.attributes[4]" 
   *        E.g.: "system.attributes" 
   * @param {Boolean | undefined} render If true, will trigger a re-render of the associated document sheet. 
   * * Default 'true'. 
   * 
   * @async
   */
  async deleteByPath(propertyPath, render = true) {
    if (propertyPath.startsWith(this.#pathOnParent)) {
      this.#parentDocument.deleteByPath(propertyPath, render);
    } else {
      const newPath = `${this.#pathOnParent}.${propertyPath}`;
      this.#parentDocument.deleteByPath(newPath, render);
    }
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
    let path = this.#pathOnParent.split(".");
    path.pop();
    path = path.join(".");
    return PropertyUtil.getNestedPropertyValue(this.#parentDocument, path);
  }

  /**
   * Updates the collection that contains this document instance. 
   * @private
   */
  #setCollection(newCollection) {
    let path = this.#pathOnParent.split(".");
    path.pop();
    path = path.join(".");
    this.#parentDocument.updateByPath(path, newCollection);
  }
}
