import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
import ViewModel from "./view-model.mjs";

/**
 * Represents the abstract base implementation of a sheet view model. 
 * 
 * @extends ViewModel
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
export default class BaseSheetViewModel extends ViewModel {
  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Id used for the HTML element's id and name attributes. 
   * @param {ViewModel | undefined} args.parent Optional. Parent ViewModel instance of this instance. 
   * If undefined, then this ViewModel instance may be seen as a "root" level instance. A root level instance 
   * is expected to be associated with an actor sheet or item sheet or journal entry or chat message and so on.
   * @param {Boolean | undefined} args.isEditable If true, the sheet is editable. 
   * 
   * @param {TransientDocument} args.document The represented transient document instance. 
   * @param {ActorSheet | ItemSheet} args.sheet The parent sheet instance. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["document", "sheet"]);

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
