import TransientDocument from "../../business/document/transient-document.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import ViewModel from "./view-model.mjs";

/**
 * Represents the abstract base implementation of a sheet view model. 
 * 
 * @extends ViewModel
 * 
 * @property {Number} _scrollValue Cached scroll value of the sheet. 
 * * Private
 * 
 * @abstract
*/
export default class BaseSheetViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { throw new Error("NotImplementedException"); }

  /** @override */
  get entityId() { return this.document.id; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a contextual template, 
   * which will be displayed in exception log entries, to aid debugging. 
   * 
   * @param {TransientDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document", "sheet"]);

    this.document = args.document;
    this.sheet = args.sheet;

    // Register view state properties. 
    this.registerViewStateProperty("_scrollValue");

    // Prepare scroll value. 
    this.saveScrollPosition();
  }

  /** @override */
  update(args) {
    this.saveScrollPosition();

    super.update(args);
  }

  /**
   * Restores the cached scroll value. 
   * 
   * @protected
   */
  saveScrollPosition() {
    this._scrollValue = this.sheet.scrollValue ?? 0;
    this.writeViewState();
  }
  
  /**
   * Restores the cached scroll value. 
   * 
   * @protected
  */
 restoreScrollPosition() {
    this.sheet.scrollValue = this._scrollValue;
  }
}
