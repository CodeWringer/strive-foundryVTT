import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";

export default class HealthConditionItemData extends TypeDataModel {
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
      current: new FoundrySchemaFields.NumberField({
        nullable: false,
        integer: true,
        positive: true,
        initial: 1,
        min: 1,
      }),
      maximum: new FoundrySchemaFields.NumberField({
        nullable: true,
        integer: true,
        positive: true,
        initial: null,
      }),
    }
  }
}
