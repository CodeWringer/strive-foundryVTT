import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares a Complication of a Project or of an Asset. 
 * 
 * @param {FoundrySchemaFields.StringField} name
 * @param {FoundrySchemaFields.HTMLField} description
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class ComplicationField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      name: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
      }),
      description: new FoundrySchemaFields.HTMLField({
        nullable: false,
        required: true,
        initial: "",
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}