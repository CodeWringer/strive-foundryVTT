import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import { DAMAGE_TYPES } from "../const/damage-types.mjs";

/**
 * Declares the combination of damage and damage type. 
 * 
 * @property {FoundrySchemaFields.StringField} damage A damage formula. May contain at-references. 
 * @property {FoundrySchemaFields.StringField} type
 * See `DAMAGE_TYPES` - name field.
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class DamageAndTypeField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      damage: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "0",
      }),
      type: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: DAMAGE_TYPES.pure.name,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
