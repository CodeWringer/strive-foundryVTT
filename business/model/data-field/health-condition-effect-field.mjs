import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import ReferenceField from "./reference-field.mjs";

/**
 * Declares a Health Condition effect. 
 * 
 * @property {ReferenceField} reference 
 * @property {FoundrySchemaFields.NumberField} severity The degree of the Health Condition to apply. 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class HealthConditionEffectField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      reference: new ReferenceField(),
      severity: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 0,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
