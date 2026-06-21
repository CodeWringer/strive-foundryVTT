import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares a Complication of a Project or of an Asset. 
 * 
 * @param {String} name
 * @param {String} description
 */
export default class ComplicationField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      name: new FoundrySchemaFields.String({
        nullable: false,
        required: true,
        initial: "",
      }),
      name: new FoundrySchemaFields.HTMLField({
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