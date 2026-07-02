import { ValidationUtil } from "../../../../../common/util/validation-utility.mjs";
import Tooltip from "../../../component/tooltip/tooltip.mjs";
import BaseSheetViewModel from "../../../view-model/base-sheet-viewmodel.mjs";
import ViewModel from "../../../view-model/view-model.mjs";

/**
 * Represents the abstract base class for all view models that represent 
 * an item sheet. 
 * 
 * @property {String} contentTemplate Returns the relative url of the content template. 
 * E. g. `TEMPLATES.application.item.language`
 * * Read-only
 * 
 * @extends BaseSheetViewModel
 * 
 * @abstract 
 */
export default class BaseItemSheetViewModel extends BaseSheetViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.BASE_ITEM_SHEET; }
  
  /** @override */
  get clazz() { return BaseItemSheetViewModel; }

  /**
   * Returns the relative url of the content template. 
   * E. g. `TEMPLATES.application.item.language`
   * @type {String}
   * @readonly
   * @abstract
   */
  get contentTemplate() { throw new Error("Not implemented"); }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * 
   * @param {TransientDocument} args.document 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;
  }

  /**
   * Returns the root owning document of the list item, if it has one. 
   * Otherwise, returns the list item itself.  
   * 
   * @returns {TransientDocument}
   * 
   * @protected
   */
  getRootOwningDocument() {
    if (this.document.owningDocument !== undefined) {
      return this.document.owningDocument;
    } else {
      return this.document;
    }
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
  }

  /** @override */
  dispose() {
    super.dispose();

    // An extremely aggressive band-aid solution. But, this ensures lingering tool tip elements 
    // with (at least partially) dynamic IDs are always cleared properly. 
    Tooltip.removeAllToolTipElements();
  }
}
