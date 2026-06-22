import DomainDataField from "./domain-data-field.mjs";

/**
 * Represents a document reference through a uuid or name. 
 * 
 * @property {Object} desperate
 * @property {String} desperate.name
 * @property {Number} desperate.cost
 * @property {String} desperate.description
 * @property {Object} heroic
 * @property {String} heroic.name
 * @property {Number} heroic.cost
 * @property {String} heroic.description
 * 
 * @extends DomainDataField
 */
export default class MomentumAction extends DomainDataField {
  /**
   * @param {Object} dto 
   * @param {Object} dto.desperate
   * @param {String} dto.desperate.name
   * @param {Number} dto.desperate.cost
   * @param {String} dto.desperate.description
   * @param {Object} dto.heroic
   * @param {String} dto.heroic.name
   * @param {Number} dto.heroic.cost
   * @param {String} dto.heroic.description
   * 
   * @returns {MomentumAction}
   * 
   * @static
   * @override
   */
  static fromDto(dto) {
    return new MomentumAction({
      desperate: dto.desperate,
      heroic: dto.heroic,
    });
  }

  /**
   * @param {Object} args 
   * @param {Object} args.desperate
   * @param {String} args.desperate.name
   * @param {Number} args.desperate.cost
   * @param {String} args.desperate.description
   * @param {Object} args.heroic
   * @param {String} args.heroic.name
   * @param {Number} args.heroic.cost
   * @param {String} args.heroic.description
   */
  constructor(args = {}) {
    this.desperate = args.desperate;
    this.heroic = args.heroic;
  }

  /** @override */
  toDto() {
    return {
      desperate: this.desperate,
      heroic: this.heroic,
    };
  }
}
