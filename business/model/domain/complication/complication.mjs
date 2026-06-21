import { common } from "../../../../common/_module.mjs";

/**
 * Represents a Complication of a Project or of an Asset. 
 * 
 * @property {String} name
 * @property {String} description Html content. 
 * 
 * @extends DomainDataField
 */
export default class Complication extends DomainDataField {
  /**
   * @param {Object} dto 
   * @param {String} dto.name 
   * @param {String | undefined} dto.description 
   * 
   * @returns {Complication}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new Complication({
      name: dto.name,
      description: dto.description ?? "",
    });
  }

  /**
   * @param {Object} args 
   * @param {String} args.name
   * @param {String} args.description Html content. 
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["name"]);
    this.name = args.name;
    this.description = args.description ?? "";
  }

  /** @override */
  toDto() {
    return {
      name: this.name,
      description: this.description,
    };
  }
}
