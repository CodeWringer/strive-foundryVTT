import { ValidationUtil } from "../../common/util/validation-utility.mjs";
import Persistable from "./persistable.mjs";
import Reference from "./reference.mjs";

/**
 * @property {String} dataPath Property path on the target document which identifies the 
 * property to modify. 
 * @property {Number} value How much the value identified by `dataPath` is modified. Can be negative 
 * and positive.
 * @property {Reference} source ID of the source. For example the ID of an embedded document. 
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
      source: Reference.fromDto(dto.source),
    });
  }

  /**
   * @param {Object} args
   * @param {String} args.dataPath Property path on the target document which identifies the 
   * property to modify. 
   * @param {Number | undefined} args.value How much the value identified by `dataPath` is modified. Can be negative 
   * and positive.
   * @param {Reference | undefined} args.source ID of the source. For example the ID of an embedded document. 
   */
  constructor(args = {}) {
    super(args);
    ValidationUtil.validateOrThrow(args, ["dataPath"]);

    this.dataPath = args.dataPath;
    this.value = args.value ?? 0;
    this.source = args.source ?? new Reference();
  }

  /** @override */
  toDto() {
    return {
      dataPath: this.dataPath,
      value: this.value,
      source: this.source.toDto(),
    };
  }
}
