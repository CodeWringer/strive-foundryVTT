import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares a log entry of a driver change. 
 * 
 * @property {FoundrySchemaFields.NumberField} index 
 * @property {FoundrySchemaFields.StringField} date 
 * @property {FoundrySchemaFields.HTMLField} oldValue 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class DriverHistoryEntryField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      index: new FoundrySchemaFields.NumberField({
        nullable: false,
        initial: 0,
      }),
      date: new FoundrySchemaFields.StringField({
        nullable: true,
      }),
      oldValue: new FoundrySchemaFields.HTMLField({
        nullable: true,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}