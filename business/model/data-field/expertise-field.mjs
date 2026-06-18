import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import GradedEffectField from "./graded-effect-field.mjs";

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
export default class ExpertiseField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      description: new FoundrySchemaFields.HTMLField({
        blank: true,
        nullable: false,
        initial: "",
      }),
      gmNotes: new FoundrySchemaFields.HTMLField(),
      requiredLevel: new FoundrySchemaFields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
      }),
      tags: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.StringField(), {
        nullable: false,
        initial: [],
      }),
      actionPoints: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.NumberField({
          min: 0,
          initial: 0,
          integer: true,
        }),
      }),
      distance: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.StringField({}),
      }),
      targetingType: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.StringField({}),
      }),
      obstacle: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.StringField({}),
      }),
      opposedBy: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.StringField({}),
      }),
      advancement: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        progress: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
      }),
      gradedEffects: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        entries: new FoundrySchemaFields.ArrayField(new GradedEffectField()),
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}