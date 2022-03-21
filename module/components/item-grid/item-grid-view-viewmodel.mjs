import { TEMPLATES } from "../../templatePreloader.mjs";
import { validateOrThrow } from "../../utils/validation-utility.mjs";
import InputViewModel from "../input-viewmodel.mjs";
import { ItemGridView } from "./item-grid-view.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {Boolean} isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from InputViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} propertyPath The path used to look up the value. 
 * @property {Object} propertyOwner An object on which to to look up the value. 
 * @property {Any} value Gets or sets the looked up value. 
 * 
 * --- Own properties
 * 
 * @property {ItemGridView} itemGridView 
 * @property {Number} gridWidth 
 */
export default class ItemGridViewViewModel extends InputViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_ITEM_GRID_VIEW; }

  /**
   * The possessions item grid.
   * @type {ItemGridView}
   * @private
   */
  _itemGridView = undefined;
  /**
   * The possessions item grid.
   * @type {ItemGridView}
   * @readonly
   */
  get itemGridView() { return this._itemGridView; }

  /**
   * @type {Number}
   * @private
   */
  _gridWidth = undefined;
  /**
   * Width of the grid, in pixels. 
   * @type {Number}
   * @readonly
   */
  gridWidth() { return this._gridWidth; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {Object} args.propertyOwner An object on which to to look up the value. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * @param {String | undefined} args.contextTemplate Optional. Name or path of a template that embeds this input component. 
   * 
   * @param {Number | undefined} args.gridWidth Optional. Width of the grid, in pixels. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["propertyPath", "propertyOwner"]);

    this._gridWidth = args.gridWidth ?? 550; // This magic constant is based on the assumption that the actor sheet is about 560px wide. TODO: Un-magic this.
  }

  /**
   * @override
   * @see {InputViewModel}
   */
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    const assets = this.value;
    const columnCount = assets.grid.length;
    const tileSize = Math.floor(this._gridWidth / columnCount);
    this._itemGridView = new ItemGridView(html, this.id, this.propertyOwner, this._gridWidth, tileSize);
  }

  /**
   * @override
   * @see {ViewModel}
   */
  dispose() {
    this._itemGridView.dispose();

    super.dispose();
  }
}

Handlebars.registerHelper('createItemGridViewViewModel', function(id, isEditable, propertyOwner, propertyPath, gridWidth) {
  return new ItemGridViewViewModel({
    id: id,
    isEditable: isEditable,
    propertyOwner: propertyOwner,
    propertyPath: propertyPath,
    gridWidth: gridWidth,
  });
});
Handlebars.registerPartial('itemGridView', `{{> "${ItemGridViewViewModel.TEMPLATE}"}}`);
