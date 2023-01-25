import { validateOrThrow } from "../util/validation-utility.mjs";

/**
 * Represents a document property. 
 * 
 * These are user-definable *tags*, in the context of their document. 
 * For example, for an asset, expected properties would be things like 
 * `"armor"`, `"clothing"`, `"holdable"` and so on.
 * 
 * @property {String} id Unique identifier. 
 * @property {String | undefined} localizableName A localization key. 
 */
export default class DocumentProperty {
  /**
   * 
   * @param args 
   * @param {String} args.id Unique identifier. 
   * @param {String | undefined} args.localizableName A localization key. 
   */
  constructor(args = {}) {
    validateOrThrow(args, ["id"]);

    this.id = args.id;
    this.localizableName = args.localizableName;
  }
}