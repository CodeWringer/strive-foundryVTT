import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import { DAMAGE_TYPES } from "../const/damage-types.mjs";

/**
 * Declares a modifier. 
 * 
 * @property {String} dataPath Property path on the target document which identifies the 
 * property to modify. 
 * @property {Number} value How much the value identified by `dataPath` is modified. Can be negative 
 * and positive.
 * @property {String | undefined} localizedName A short localized name that represents the Modifier. 
 * This could also be the name of a source document. 
 * @property {String | undefined} sourceId ID of the source. For example the ID of an embedded document. 
 */
export default class ModifierField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      damage: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "0",
      }),
      type: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: DAMAGE_TYPES.pure.name,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
