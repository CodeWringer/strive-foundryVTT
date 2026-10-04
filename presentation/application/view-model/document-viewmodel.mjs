import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import { DOCUMENT_CONTEXT } from "../../model/document-context.mjs";
import ViewModel from "./view-model.mjs";

/**
 * Wraps a document for use in a view model. 
 * 
 * @property {Object} document
 * @property {Boolean} isOwner
 * 
 * @extends ViewModel
 */
export default class DocumentViewModel extends ViewModel {
  /** @override */
  get clazz() { return DocumentViewModel; }

  /**
   * Returns true, if the current user is the owner of the represented document. 
   * @type {Boolean}
   * @readonly
   */
  get isOwner() {
    if (ValidationUtil.isDefined(this.document)) {
      return this.document.isOwner;
    } else {
      return false;
    }
  }

  /**
   * Returns `true`, if GM or user-specific secrets contained by this view model are to be shown. 
   * @type {Boolean}
   * @readonly
   */
  get showSecrets() { return this.isOwner; }
  set showSecrets(_) { throw new Error("Cannot set showSecrets of DocumentViewModel"); }

  /**
   * @type {Object}
   * @private
   */
  #document;
  get document() {
    return this.#document;
  }
  set document(value) {
    if (!ValidationUtil.isDefined(value) || !ValidationUtil.isObject(value)) {
      throw new Error("document must be an object");
    }
    this.#document = value;
  }

  /**
   * Returns `true`, if this is an embedded document. 
   * @type {Boolean}
   * @readonly
   */
  get isEmbedded() { return this.context === DOCUMENT_CONTEXT.embedded; }

  /**
   * Returns `true`, if this is an independent (i. e. not embedded) document. 
   * @type {Boolean}
   * @readonly
   */
  get isIndependent() { return this.context === DOCUMENT_CONTEXT.independent; }

  /**
   * @param {Object} args The arguments object. 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * 
   * If no value is provided, a shortened UUID will be generated for it. 
   * 
   * This string may not contain any special characters! Alphanumeric symbols, as well as hyphen ('-') and 
   * underscore ('_') are permitted, but no dots, brackets, braces, slashes, equal sign, and so on. Failing to comply to this 
   * naming restriction may result in DOM elements not being properly detected by the `activateListeners` method. 
   * @param {ViewModel | undefined} args.parent Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the view model data is editable.
   * * Default `false`. 
   * @param {Boolean | undefined} args.visible
   * * default `true`
   * @param {ViewModelToolTipDefinition | undefined} args.toolTip Creates a tool tip definition.
   * 
   * @param {Object} args.document An associated data document. 
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["document"]);

    if (ValidationUtil.isDefined(args.document) && ValidationUtil.isDefined(args.document.getTransientObject)) {
      this.#document = args.document.getTransientObject();
    } else if (ValidationUtil.isDefined((args.document ?? {}).document) && ValidationUtil.isDefined((args.document ?? {}).document.getTransientObject)) {
      this.#document = args.document.document.getTransientObject();
    } else {
      this.#document = args.document;
    }
  }
  
  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    if (this.isIndependent) {
      this.element.find(".embedded-only").addClass("hidden");
    }
    this.element.on("mouseenter", (e) => {
      this.element.find(".hover-only").removeClass("hidden");
    });
    this.element.on("mouseleave", (e) => {
      this.element.find(".hover-only").addClass("hidden");
    });
  }
}
