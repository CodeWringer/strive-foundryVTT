import { TEMPLATES } from "../../template/templatePreloader.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";
import { ItemGridView } from "./item-grid-view.mjs";
import { ItemGrid } from './item-grid.mjs';
import PlainDialog from "../../dialog/plain-dialog/plain-dialog.mjs";

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
   * @type {ItemGrid}
   * @private
   */
  _itemGrid = undefined;
  /**
   * @type {ItemGrid}
   */
  get itemGrid() { return this._itemGrid; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {String} args.propertyPath The path used to look up the value. 
   * @param {TransientBaseCharacterActor} args.propertyOwner An object on which to to look up the value. 
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

    this._initializeItemGrid(this.propertyOwner);
    this._itemGridView = new ItemGridView(html, this.id, this._itemGrid, this._gridWidth, isEditable);
  }

  /**
   * @override
   * @see {ViewModel}
   */
  dispose() {
    this._itemGridView.dispose();

    super.dispose();
  }

  /**
   * Initializes the item grid. 
   * @param {TransientBaseCharacterActor} actor 
   * @private
   * @async
   */
  async _initializeItemGrid(actor) {
    const itemGridLoadResult = ItemGrid.from(actor);
    this._itemGrid = itemGridLoadResult.itemGrid;
    
    if (itemGridLoadResult.itemsDropped.length > 0) {
      for (const item of itemGridLoadResult.itemsDropped) {
        // Move item to property (= drop from person). 
        await item.updateProperty("data.data.isOnPerson", false, false); // Update the property without triggering a re-render. 
      }
      
      // Display a warning dialog. 
      await new PlainDialog({
        localizedTitle: game.i18n.localize("ambersteel.character.asset.carryingCapacity.dialog.titleItemsDropped"),
        localizedContent: actor.name
        + "\n"
        + game.i18n.localize("ambersteel.character.asset.carryingCapacity.dialog.contentItemsDropped")
        + "\n"
        + itemGridLoadResult.itemsDropped.map(it => it.name).join(",\n")
      }).renderAndAwait(true);

      await this._itemGrid.synchronizeTo(actor, true);
    } else if (itemGridLoadResult.itemsError.length > 0) {
      // Synchronizing here should purge any bad indices. 
      await this._itemGrid.synchronizeTo(actor, true);
    }
  }
}

Handlebars.registerPartial('itemGridView', `{{> "${ItemGridViewViewModel.TEMPLATE}"}}`);
