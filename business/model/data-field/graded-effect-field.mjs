import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import { COMPARISON_TARGET_TYPES } from "../domain/const/comparison-target-types.mjs";
import { COMPARISON_TYPES } from "../domain/const/comparison-types.mjs";
import ModifierField from "./modifier-field.mjs";

/**
 * Declares a graded effect. 
 * 
 * These are the less than, equal to and greater than a certain Hits amount or 
 * Attribute threshold bound effects of an ability. 
 * 
 * @property {FoundrySchemaFields.StringField} comparison 
 * See `ComparisonType`
 * @property {FoundrySchemaFields.NumberField} threshold 
 * @property {FoundrySchemaFields.StringField} comparisonTarget 
 * E. g. `"hit"` or `"agility"`
 * @property {FoundrySchemaFields.StringField} unstructured 
 * @property {FoundrySchemaFields.ArrayField<HealthConditionEffectField>} conditions 
 * @property {FoundrySchemaFields.ArrayField<DamageAndTypeField>} damages 
 * @property {FoundrySchemaFields.ArrayField<ModifierField>} modifiers 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class GradedEffectField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      comparisonType: new FoundrySchemaFields.StringField({
        nullable: false,
        initial: COMPARISON_TYPES.less_equals.name,
      }),
      threshold: new FoundrySchemaFields.NumberField({
        nullable: false,
        initial: 0,
      }),
      comparisonTarget: new FoundrySchemaFields.SchemaField({
        type: new FoundrySchemaFields.StringField({
          nullable: false,
          initial: COMPARISON_TARGET_TYPES.hit.name,
        }),
        data: new FoundrySchemaFields.StringField({
          nullable: true,
          initial: null,
        }),
      }),
      unstructured: new FoundrySchemaFields.HTMLField({
        nullable: false,
        initial: "",
      }),
      modifiers: new FoundrySchemaFields.ArrayField(new ModifierField(), {
        nullable: false,
        initial: [],
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
