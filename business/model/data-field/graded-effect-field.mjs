import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import { COMPARISON_TYPES } from "../domain/const/comparison-types.mjs";
import DamageAndTypeField from "./damage-and-type-field.mjs";
import HealthConditionEffectField from "./health-condition-effect-field.mjs";
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
      comparison: new FoundrySchemaFields.StringField({
        required: true,
        nullable: false,
        initial: COMPARISON_TYPES.equals.name,
      }),
      threshold: new FoundrySchemaFields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
      }),
      comparisonTarget: new FoundrySchemaFields.StringField({}),
      unstructured: new FoundrySchemaFields.HTMLField({
        nullable: true,
      }),
      conditions: new FoundrySchemaFields.ArrayField(new HealthConditionEffectField(), {
        nullable: false,
        initial: []
      }),
      damages: new FoundrySchemaFields.ArrayField(new DamageAndTypeField(), {
        nullable: false,
        initial: []
      }),
      modifiers: new FoundrySchemaFields.ArrayField(new ModifierField(), {
        nullable: false,
        initial: []
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
