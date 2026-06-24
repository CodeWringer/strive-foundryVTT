import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import ReferenceField from "./reference-field.mjs";

/**
 * Declares an asset slot (on a Character). 
 * 
 * @property {FoundrySchemaFields.StringField} name Internal name of the asset slot, e.g. "clothing".
 * @property {ReferenceField} containedAsset Identifies the currently alotted asset. 
 * @property {FoundrySchemaFields.StringField} group If not null, the name of an asset slot group. All asset 
 * slots in the same group may share the same asset, if its bulk is too much for just 
 * one slot to hold. 
 * @property {FoundrySchemaFields.ArrayField<String>} acceptedTypes An array of accepted type names. E. g. 
 * `["clothing", "armor"]`
 * @property {FoundrySchemaFields.NumberField} maximumBulk The maximum bulk this asset slot is allowed to hold. 
 * 
 * @property {FoundrySchemaFields.SchemaField} offset Center-relative offsets, in pixels. 
 * @property {FoundrySchemaFields.NumberField} offset.x Center-relative horizontal offset, in pixels. 
 * @property {FoundrySchemaFields.NumberField} offset.y Center-relative vertical offset, in pixels. 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class AssetSlotField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      name: new FoundrySchemaFields.StringField(),
      containedAsset: new ReferenceField(),
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