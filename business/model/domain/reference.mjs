import { common } from "../../../common/_module.mjs";
import { ValidationUtil } from "../../../common/util/validation-utility.mjs";
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
   * @returns {Reference | null}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    if (ValidationUtil.isDefined(dto) && (ValidationUtil.isDefined(dto.uuid) || ValidationUtil.isDefined(dto.name))) {
      return new Reference({
        uuid: dto.uuid,
        name: dto.name,
      });
    } else {
      return null;
    }
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.uuid 
   * @param {String | undefined} args.name 
   */
  constructor(args = {}) {
    super(args);

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
