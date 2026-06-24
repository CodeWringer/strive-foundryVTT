import { common } from "../../../../common/_module.mjs";
import Persistable from "../persistable.mjs";
import Reference from "../reference.mjs";

/**
 * Represents an asset slot. 
 * 
 * @property {String} name Internal name of the asset slot, e.g. "clothing".
 * @property {Reference} containedAsset Identifies the currently alotted asset. 
 * @property {String | null} group If not null, the name of an asset slot group. All asset 
 * slots in the same group may share the same asset, if its bulk is too much for just 
 * one slot to hold. 
 * @property {Array<String>} acceptedTypes An array of accepted type names. E. g. 
 * `["clothing", "armor"]`
 * @property {Number} maximumBulk The maximum bulk this asset slot is allowed to hold. 
 * 
 * @property {Object} offset Center-relative offsets, in pixels. 
 * @property {Number} offset.x Center-relative horizontal offset, in pixels. 
 * @property {Number} offset.y Center-relative vertical offset, in pixels. 
 */
export default class AssetSlot extends Persistable {
  /** @override */
  static fromDto(dto) {
    return new AssetSlot({
      name: dto.name,
      containedAsset: Reference.fromDto(dto.containedAsset),
      group: dto.group,
      acceptedTypes: dto.acceptedTypes,
      maximumBulk: dto.maximumBulk,
      offset: dto.offset,
    });
  }

  /**
   * @param {Object} args
   * @param {String} args.name Internal name of the asset slot, e.g. "clothing".
   * @param {Reference | undefined} args.containedAsset Identifies the currently alotted asset. 
   * @param {String | undefined} args.group If not null, the name of an asset slot group. All asset 
   * slots in the same group may share the same asset, if its bulk is too much for just 
   * one slot to hold. 
   * @param {Array<String> | undefined} args.acceptedTypes An array of accepted type names. E. g. 
   * `["clothing", "armor"]`
   * @param {Number | undefined} args.maximumBulk The maximum bulk this asset slot is allowed to hold. 
   * 
   * @param {Object | undefined} args.offset Center-relative offsets, in pixels. 
   * @param {Number | undefined} args.offset.x Center-relative horizontal offset, in pixels. 
   * @param {Number | undefined} args.offset.y Center-relative vertical offset, in pixels. 
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.containedAsset = args.containedAsset ?? new Reference();
    this.group = args.group ?? null;
    this.acceptedTypes = args.acceptedTypes ?? [];
    this.maximumBulk = args.maximumBulk ?? 0;
    this.offset = args.offset ?? {
      x: 0,
      y: 0,
    };
  }

  /** @override */
  toDto() {
    return {
      name: this.name,
      containedAsset: this.containedAsset.toDto(),
      group: this.group,
      acceptedTypes: this.acceptedTypes,
      maximumBulk: this.maximumBulk,
      offset: this.offset,
    };
  }
}
