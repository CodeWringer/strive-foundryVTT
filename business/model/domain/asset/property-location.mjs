import { common } from "../../../../common/_module.mjs";
import Persistable from "../persistable.mjs";
import Reference from "../reference.mjs";

/**
 * Represents a property location, with asset references. 
 * 
 * @property {String} id 
 * @property {String} name 
 * @property {Array<Reference>} assets References to all assets 
 * contained by this location. 
 */
export default class PropertyLocation extends Persistable {
 /** @override */
  static fromDto(dto) {
    return new PropertyLocation({
      id: dto.id,
      name: dto.name,
      assets: dto.assets.map(it => Reference.fromDto(it)),
    });
  }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id 
   * @param {String | undefined} args.name 
   * @param {Array<Reference> | undefined} args.assets References to all assets 
   * contained by this location. 
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["name"]);

    this.id = args.id ?? common.util.uuid.createUuid();
    this.name = args.name ?? "Unknown"; // TODO: loca
    this.assets = args.assets ?? [];
  }

  /** @override */
  toDto() {
    return {
      id: this.id,
      name: this.name,
      assets: this.assets.map(it => it.toDto()),
    };
  }
}
