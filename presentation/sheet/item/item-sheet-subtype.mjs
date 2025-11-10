import BaseSheetSubType from "../base-sheet-subtype.mjs";

/**
 * Defines an ItemSheet sub-type, specific to one of the Item document types. 
 * 
 * @abstract Inheritors MUST override:
 * * `template`
 * * `localizedType`
 * * `createViewModel`
 * 
 * Inheritors *may* override: 
 * * `getTitle`
 * * `activateListeners`
 * * `getHeaderButtons`
 * * `onDropItem`
 * 
 * @extends BaseSheetSubType
 */
export default class ItemSheetSubType extends BaseSheetSubType {
  // No custom logic, atm.
}
