import BaseSheetSubType from "../base-sheet-subtype.mjs";

/**
 * Defines an ActorSheet sub-type, specific to one of the Actor document types. 
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
export default class ActorSheetSubType extends BaseSheetSubType {
  // No custom logic, atm.
}
