import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";
import ModifierField from "../../data-field/modifier-field.mjs";

/**
 * Abstract base item model. 
 * 
 * @property {FoundrySchemaFields.HTMLField} description
 * @property {FoundrySchemaFields.HTMLField} gmNotes
 * @property {FoundrySchemaFields.ArrayField<ModifierField>} modifiers
 * 
 * @abstract Inheritors _should_ override:
 * `static defineSchema()`
 */
export default class BaseItemData extends TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new FoundrySchemaFields.HTMLField({
        blank: true,
        nullable: false,
        initial: "",
      }),
      gmNotes: new FoundrySchemaFields.HTMLField({
        blank: true,
        nullable: false,
        initial: "",
      }),
      modifiers: new FoundrySchemaFields.ArrayField(new ModifierField(), {
        nullable: false,
        initial: [],
      }),
    }
  }
}
