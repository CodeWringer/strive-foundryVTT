import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";

/**
 * Represents the data of an Item document that was drag and dropped onto a sheet. 
 * 
 * @property {String} id ID of the Item document. 
 * @property {String} contentType Content type of the Item document. 
 * 
 * @property {Object} owningDocument 
 * @property {String | undefined} owningDocument.id ID of the owning document, 
 * if there is one. 
 * @property {String | undefined} owningDocument.contentType Content type of the owning document, 
 * if there is one. 
 */
export default class ItemDropData {
  /**
   * @param {Object} args 
   * @param {String} args.id ID of the Item document. 
   * @param {String} args.contentType Content type of the Item document. 
   * 
   * @param {Object | undefined} args.owningDocument 
   * @param {String | undefined} args.owningDocument.id ID of the owning document, 
   * if there is one. 
   * @param {String | undefined} args.owningDocument.contentType Content type of the owning document, 
   * if there is one. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["id", "contentType"]);

    this.id = args.id;
    this.contentType = args.contentType;

    const owningDocument = args.owningDocument ?? {};
    this.owningDocument = {
      id: owningDocument.id,
      contentType: owningDocument.contentType,
    };
  }
}
