import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import DocumentViewModel from "./document-viewmodel.mjs";
import ViewModel from "./view-model.mjs";

/**
 * Represents the abstract base implementation of a sheet view model. 
 * 
 * @extends DocumentViewModel
 * 
 * @abstract Inheritors MUST override: 
 * * `static get TEMPLATE`
 * * `get clazz`
 * 
 * @property {TransientDocument} document The underlying data document instance. 
 * This represents a concrete Actor or Item document instance. 
 * @property {Number} _scrollValue Cached scroll value of the sheet. 
 * * Private
 */
export default class BaseSheetViewModel extends DocumentViewModel {
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
   * @param {TransientDocument} args.document An associated data document. 
   * 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["sheet"]);

    this.sheet = args.sheet;

    // Register view state properties. 
    this.registerViewStateProperty("_scrollValue");

    // Prepare scroll value. 
    this.saveScrollPosition();

    game.strive.viewModels.add(this);
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

  /** @override */
  dispose() {
    game.strive.viewModels.remove(this.id);
    super.dispose();
  }
}
