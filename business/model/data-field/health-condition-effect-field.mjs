import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import ReferenceField from "./reference-field.mjs";

/**
 * Declares a Health Condition effect. 
 * 
 * @property {Object} reference 
 * @property {String | null} reference.uuid 
 * @property {String | null} reference.name 
 * @property {Number} severity The degree of the Health Condition to apply. 
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
