import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares an asset slot (on a Character). 
 * 
 * @param {String} name Internal name of the asset slot, e.g. "clothing".
 * @param {String | null} containedAssetId ID of the Asset currently alotted to this slot. 
 * @param {String | null} group If not null, the name of an asset slot group. All asset 
 * slots in the same group may share the same asset, if its bulk is too much for just 
 * one slot to hold. 
 * @param {Array<String>} acceptedTypes An array of accepted type names. E. g. 
 * `["clothing", "armor"]`
 * @param {Number} maximumBulk The maximum bulk this asset slot is allowed to hold. 
 * 
 * @param {Object} offset Center-relative offsets, in pixels. 
 * @param {Number} offset.x Center-relative horizontal offset, in pixels. 
 * @param {Number} offset.y Center-relative vertical offset, in pixels. 
 */
export default class AssetSlotField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      name: new FoundrySchemaFields.StringField(),
      containedAssetId: new FoundrySchemaFields.DocumentUUIDField({
        embedded: true,
      }),
      group: new FoundrySchemaFields.StringField({
        nullable: true,
      }),
      acceptedTypes: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.StringField(), {}),
      maximumBulk: new FoundrySchemaFields.NumberField({
        required: true,
        nullable: false,
        initial: 4,
        min: 0,
      }),
      offset: new FoundrySchemaFields.SchemaField({
        x: new FoundrySchemaFields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        y: new FoundrySchemaFields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}