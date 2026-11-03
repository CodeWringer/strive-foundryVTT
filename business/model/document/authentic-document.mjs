import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import DocumentUpdater from "./document-updater/document-updater.mjs";
import Document from "./document.mjs";

/**
 * Represents the abstract base class for all independent documents. These are all the main-stay documents 
 * that have a data-model equivalent. 
 * 
 * @abstract Inheritors MUST implement: 
 * * `get clazz`
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

  /**
   * Returns the document type name. See `GENERAL_DOCUMENT_TYPES`. 
   * E. g. `"Actor"`
   * 
   * @type {String}
   * @readonly
   */
  get documentName() { return this.#document.documentName; }

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
