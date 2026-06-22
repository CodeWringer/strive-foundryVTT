import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares an attribute (on a Character). 
 * 
 * @param {String} name Internal name of the attribute, e.g. "agility".
 * @param {Number} level The current raw level of the attribute.
 */
export default class CharacterAttributeField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      name: new FoundrySchemaFields.StringField(),
      level: new FoundrySchemaFields.NumberField({
        required: true,
        nullable: false,
        initial: 1,
        min: 0,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}