import { createUUID } from "../../util/uuid-utility.mjs";

/**
 * Represents an asset slot. 
 * 
 * @property {String} id Unique ID. 
 * * Read-only. 
 * @property {String | undefined} customName A user-defined name. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {Array<String>} acceptedTypes An array of asset type names that this 
 * slot may hold. E. g. `["clothing"]`
 * @property {String | null} alottedId If not null, the ID of an asset document 
 * that has been alotted to this slot. 
 */
export default class AssetSlot {
  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID. 
   * @param {String | undefined} args.customName A user-defined name. 
   * @param {String | undefined} args.localizableName Localization key. 
   * @param {Array<String> | undefined} args.acceptedTypes An array of asset 
   * type names that this slot may hold. E. g. `["clothing"]`
   * @param {String | undefined} args.alottedId The ID of an asset document 
   * that has been alotted to this slot. 
   */
  constructor(args = {}) {
    this.id = args.id ?? createUUID();
    this.customName = args.customName;
    this.acceptedTypes = args.acceptedTypes ?? [];
    this.localizableName = args.localizableName;
    this.alottedId = args.alottedId ?? null;
  }
}