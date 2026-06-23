import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import Persistable from "./persistable.mjs";

/**
 * @property {String} dataPath Property path on the target document which identifies the 
 * property to modify. 
 * @property {Number} value How much the value identified by `dataPath` is modified. Can be negative 
 * and positive.
 * @property {String | undefined} localizedName A short localized name that represents the Modifier. 
 * This could also be the name of a source document. 
 * @property {String | undefined} sourceId ID of the source. For example the ID of an embedded document. 
 * 
 * @extends Persistable
 */
export default class Modifier extends Persistable {
  /**
   * @param {Object} dto 
   * 
   * @returns {Modifier}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new Modifier({
      dataPath: dto.dataPath,
      value: dto.value,
      localizedName: dto.localizedName,
      sourceId: dto.sourceId,
    });
  }

  /**
   * @param {Object} args
   * @param {String} args.dataPath Property path on the target document which identifies the 
   * property to modify. 
   * @param {Number} args.value How much the value identified by `dataPath` is modified. Can be negative 
   * and positive.
   * @param {String | undefined} args.localizedName A short localized name that represents the Modifier. 
   * This could also be the name of a source document. 
   * @param {String | undefined} args.sourceId ID of the source. For example the ID of an embedded document. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["dataPath", "value"]);

    this.dataPath = args.dataPath;
    this.value = args.value;
    this.localizedName = args.localizedName;
    this.sourceId = args.sourceId;
  }

  /** @override */
  toDto() {
    return {
      dataPath: this.dataPath,
      value: this.value,
      localizedName: this.localizedName,
      sourceId: this.sourceId,
    };
  }
}
