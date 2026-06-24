import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares a log entry of an advancement change. 
 * 
 * @property {FoundrySchemaFields.NumberField} amount 
 * @property {FoundrySchemaFields.String} date 
 * @property {FoundrySchemaFields.String} reason 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class AdvancementHistoryEntryField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      amount: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 0,
      }),
      date: new FoundrySchemaFields.StringField({
        nullable: true,
      }),
      reason: new FoundrySchemaFields.StringField({
        nullable: true,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}