import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";

export default class LanguageItemData extends TypeDataModel {
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
      grade: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 0,
        integer: true,
        min: 0,
        max: 2,
        positive: true,
      }),
    }
  }
}
