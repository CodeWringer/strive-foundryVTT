import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import { COMPARISON_TYPES } from "../const/comparison-types.mjs";

/**
 * Declares a graded effect. 
 * 
 * These are the less than, equal to and greater than a certain Hits amount or 
 * Attribute threshold bound effects of an ability. 
 * 
 * @param {String} comparison 
 * See `ComparisonType`
 * @param {Number} threshold 
 * @param {String} comparisonTarget 
 * E. g. `"hit"` or `"agility"`
 * @param {String} effects 
 */
export default class GradedEffectField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      comparison: new FoundrySchemaFields.StringField({
        required: true,
        nullable: false,
        initial: COMPARISON_TYPES.EQUALS.name,
      }),
      comparisonTarget: new FoundrySchemaFields.StringField({}),
      threshold: new FoundrySchemaFields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
      }),
      effects: new FoundrySchemaFields.StringField({}),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
