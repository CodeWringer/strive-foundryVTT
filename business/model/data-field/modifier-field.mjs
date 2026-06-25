import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import ReferenceField from "./reference-field.mjs";

/**
 * Declares a modifier. 
 * 
 * @property {FoundrySchemaFields.StringField} dataPath Property path on the target 
 * document which identifies the property to modify. 
 * @property {FoundrySchemaFields.NumberField} value How much the value identified by 
 * `dataPath` is modified. Can be negative and positive.
 * @property {ReferenceField} source ID of the source. For example the ID of an embedded document. 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class ModifierField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      dataPath: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
      }),
      value: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 0,
      }),
      source: new ReferenceField(),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
