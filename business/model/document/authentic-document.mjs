import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import DataFieldBridge from "./data-bridge/data-field-bridge.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs";
import Document from "./document.mjs";

/**
 * Represents the abstract base class for all independent documents. These are all the main-stay documents 
 * that have a data-model equivalent. 
 * 
 * @abstract Inheritors MUST implement: 
 * * `get clazz`
 * 
 * @property {String} img
 * @property {String} name
 * @property {String} description
 * @property {String | null} gmNotes
 */
export default class AuthenticDocument extends Document {
  /** @override */
  get clazz() { return AuthenticDocument; }

  /** @override */
  get id() { return this.#document.id; }

  /** @override */
  get type() { return this.#document.type; }

  /** @override */
  get pack() { return this.#document.pack; }

  /** @override */
  get isOwner() { return this.#document.isOwner ?? this.#document.owner ?? false; }

  /** @override */
  get isEmbedded() { return ValidationUtil.isDefined(this.#document.parent); }

  /** @override */
  get isLocked() { return ValidationUtil.isDefined(this.#document.pack) && this.#document.pack.metadata.locked; }
  
  /** @override */
  get parentDocument() {
    if (ValidationUtil.isDefined(this.#document.parent)) {
      return this.#document.parent.getEnhancedDocument();
    } else {
      return null;
    }
  }
  
  /**
   * Returns the document type name. See `GENERAL_DOCUMENT_TYPES`. 
   * E. g. `"Actor"`
   * 
   * @type {String}
   * @readonly
   */
  get documentName() { return this.#document.documentName; }

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
   * @type {Object}
   * @private
   */
  #document;

  /**
   * @param {Object} args 
   * @param {Object} args.document FoundryVTT document. 
   */
  constructor(args = {}) {
    super({
      ...args,
      updater: new DocumentUpdater(args.document),
    });
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.#document = args.document;

    this._img = new DataFieldBridge({
      document: this.#document,
      dataPath: "img",
      onChange: (newValue, oldValue) => {
        this._onChangeCallbacks.invoke("img", newValue, oldValue);
      },
    });
    this._name = new DataFieldBridge({
      document: this.#document,
      dataPath: "name",
      default: "Unknown",
      onChange: (newValue, oldValue) => {
        this._onChangeCallbacks.invoke("name", newValue, oldValue);
      },
    });
    this._description = new DataFieldBridge({
      document: this.#document,
      dataPath: "system.description",
      default: "",
      onChange: (newValue, oldValue) => {
        this._onChangeCallbacks.invoke("description", newValue, oldValue);
      },
    });
    this._gmNotes = new DataFieldBridge({
      document: this.#document,
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
  delete() {
    this.document.delete();
  }

  /** @override */
  async openSheet() {
    if (ValidationUtil.isDefined(this.document.sheet)) {
      return await this.document.sheet.render(true);
    } else {
      game.strive.logger.warning("sheet undefined");
    }
  }
}
