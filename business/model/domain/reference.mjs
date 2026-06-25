import { common } from "../../../common/_module.mjs";
import Persistable from "./persistable.mjs";

/**
 * Represents a document reference through a uuid or name. 
 * 
 * @property {String | null} uuid
 * @property {String | null} name
 * 
 * @extends Persistable
 */
export default class Reference extends Persistable {
  /**
   * @param {Object} dto 
   * @param {String | undefined} dto.uuid If undefined, `name` MUST be defined. 
   * @param {String | undefined} dto.name If undefined, `uuid` MUST be defined. 
   * 
   * @returns {Reference}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new Reference({
      uuid: dto.uuid,
      name: dto.name,
    });
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.uuid If undefined, `name` MUST be defined. 
   * @param {String | undefined} args.name If undefined, `uuid` MUST be defined. 
   */
  constructor(args = {}) {
    super(args);
    if (common.util.validation.isBlankOrUndefined(args.uuid) &&
      common.util.validation.isBlankOrUndefined(args.name)) {
      throw new Error("Must define either uuid or name");
    }

    this.uuid = args.uuid ?? null;
    this.name = args.name ?? null;
  }

  /** @override */
  toDto() {
    return {
      uuid: this.uuid,
      name: this.name,
    };
  }
}
