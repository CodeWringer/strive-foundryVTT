import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares a reference to a document which may be identifiable by uuid 
 * and/or name. 
 * 
 * @param {FoundrySchemaFields.DocumentUUIDField} uuid
 * @param {FoundrySchemaFields.StringField} name
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class ReferenceField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, options = {}) {
    fields = {
      uuid: new FoundrySchemaFields.DocumentUUIDField({
        nullable: true,
        required: false,
        initial: null,
      }),
      name: new FoundrySchemaFields.StringField({
        nullable: true,
        required: false,
        initial: null,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}