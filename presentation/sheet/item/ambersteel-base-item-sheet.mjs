import ItemItemSheetViewModel from "../../template/item/item/item-item-sheet-viewmodel.mjs";
import { TEMPLATES } from "../../template/templatePreloader.mjs";
import { ITEM_SHEET_SUBTYPE } from "./item-sheet-subtype.mjs";

/**
 * Represents the base contract for a "specific" item sheet "sub-type". 
 * 
 * Such a "sub-type" is really on an "enhancer", which adds properties and/or methods to a given `ItemSheet` instance. 
 * 
 * This particular type also doubles as the definition for the item of type `"item"` (= asset). 
 */
export default class AmbersteelBaseItemSheet {
  /**
   * Returns the template path. 
   * @type {String} Path to the template. 
   * @readonly
   * @virtual
   */
  get template() { return TEMPLATES.ITEM_SHEET;  }

  /**
   * Returns the localized title of this sheet type. 
   * @type {String}
   * @readonly
   */
  get title() { return game.i18n.localize("ambersteel.character.asset.singular"); }

  /**
   * Extends the given context object with derived data. 
   * 
   * This is where any data should be added, which is only required to 
   * display the data via the sheet. 
   * @param context {Object} A context data object. Some noteworthy properties are 
   * 'item', 'isSendable' and 'isEditable'. 
   * @virtual
   */
  prepareDerivedData(context) { /* Inheriting types should implement this. */ }

  getViewModel(context, item) {
    return new ItemItemSheetViewModel({
      id: item.id,
      isEditable: context.isEditable,
      isSendable: context.isSendable,
      isOwner: context.isOwner,
      isGM: context.isGM,
      item: item,
    });
  }
  
  /**
   * Register any DOM-reliant event listeners and manipulations here. 
   * 
   * @param {JQuery} html The DOM of the sheet. 
   * @param {Boolean | undefined} isOwner If true, the current user is regarded as 
   * the represented document's owner. 
   * @param {Boolean | undefined} isEditable If true, the sheet will be editable. 
   * 
   * @virtual
   */
  activateListeners(html, isOwner, isEditable) { /** Do nothing */}
}

ITEM_SHEET_SUBTYPE.set("item", new AmbersteelBaseItemSheet());
