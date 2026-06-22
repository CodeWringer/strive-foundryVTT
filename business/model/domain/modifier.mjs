import { ValidationUtil } from "../../common/util/validation-utility.mjs";

/**
 * @property {String} dataPath 
 * @property {Number} value How much the value identified by `dataPath` is modified. Can be negative 
 * and positive.
 * @property {String | undefined} localizedName A short localized name that represents the Modifier. 
 * This could also be the name of a source document. 
 * @property {String | undefined} sourceId ID of the source. For example the ID of an embedded document. 
 */
export default class Modifier {
  /**
   * @param {Object} args
   * @param {String} args.dataPath 
   * @param {Number} args.value How much the value identified by `dataPath` is modified. Can be negative 
   * and positive.
   * @param {String | undefined} args.localizedName A short localized name that represents the Modifier. 
   * This could also be the name of a source document. 
   * @param {String | undefined} args.sourceId ID of the source. For example the ID of an embedded document. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["dataPath", "value"]);

    this.dataPath = args.dataPath;
    this.value = args.value;
    this.localizedName = args.localizedName;
    this.localizedDescription = args.localizedDescription;
    this.sourceId = args.sourceId;
  }
}
