import { validateOrThrow } from "../util/validation-utility.mjs";

/**
 * Represents a document property. 
 * 
 * @property {String} id Unique identifier. 
 * @property {String | undefined} localizableName A localization key. 
 */
export default class DocumentProperty {
  /**
   * 
   * @param {Object} args 
   * @param {String} args.id Unique identifier. 
   * @param {String | undefined} args.localizableName A localization key. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["id"]);

    this.id = args.id;
    this.localizableName = args.localizableName;
  }
}