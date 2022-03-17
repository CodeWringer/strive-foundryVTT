import ViewModel from "../module/components/viewmodel.mjs";

/**
 * This view model sub-type is intended for use with sheets that expect the common flags, 
 * like 'isEditable' or 'isSendable'. 
 * @extends ViewModel
 */
export default class SheetViewModel extends ViewModel {
  /**
   * @type {Boolean}
   * @private
   */
  _isEditable = false;
  /**
   * If true, the sheet is editable. 
   * @type {Boolean}
   * @readonly
   */
  get isEditable() { return this._isEditable; }
  
  /**
   * @type {Boolean}
   * @private
   */
  _isSendable = false;
  /**
   * If true, the document represented by the sheet can be sent to chat. 
   * @type {Boolean}
   * @readonly
   */
  get isSendable() { return this._isSendable; }

  /**
   * @type {Boolean}
   * @private
   */
  _isOwner = false;
  /**
   * If true, the current user is the owner of the represented document. 
   * @type {Boolean}
   * @readonly
   */
  get isOwner() { return this._isOwner; }
  
  /**
   * @type {Boolean}
   * @private
   */
  _isGM = false;
  /**
   * If true, the current user is a GM. 
   * @type {Boolean}
   * @readonly
   */
  get isGM() { return this._isGM; }

  /**
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * 
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * @param {Boolean | undefined} args.isSendable If true, the document represented by the sheet can be sent to chat. 
   * @param {Boolean | undefined} args.isOwner If true, the current user is the owner of the represented document. 
   * @param {Boolean | undefined} args.isGM If true, the current user is a GM. 
   */
  constructor(args = {}) {
    super(args);

    this._isEditable = args.isEditable ?? false;
    this._isSendable = args.isSendable ?? false;
    this._isOwner = args.isOwner ?? false;
    this._isGM = args.isGM ?? false;
  }

  /** @override */
  toViewState() {
    return super.toViewState();
  }

  /** @override */
  applyViewState(viewState) {
    super.applyViewState(viewState);
  }
}
