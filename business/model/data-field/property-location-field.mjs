import { common } from "../../../common/_module.mjs";
import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import ReferenceField from "./reference-field.mjs";

/**
 * Declares a property location, with asset references. 
 * 
 * @property {FoundrySchemaFields.StringField} id 
 * @property {FoundrySchemaFields.StringField} name 
 * @property {FoundrySchemaFields.ArrayField<ReferenceField>} assets 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class PropertyLocationField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      id: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: common.util.uuid.createUuid(),
      }),
      name: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "Unknown", // TODO: loca
      }),
      assets: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
        nullable: false,
        initial: [],
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}