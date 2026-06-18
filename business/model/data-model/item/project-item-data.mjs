import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";

export default class ProjectItemData extends TypeDataModel {
  /** @override @see https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html#defineschema */
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
      complications: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
        nullable: false,
        initial: [],
      }),
      progress: new FoundrySchemaFields.SchemaField({
        current: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
        increment: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
        total: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
      }),
      projectSkill: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
        trim: true,
      }),
      pushes: new FoundrySchemaFields.NumberField({
        nullable: false,
        integer: true,
        positive: true,
        initial: 0,
        min: 0,
      }),
      quality: new FoundrySchemaFields.NumberField({
        nullable: false,
        integer: true,
        positive: true,
        initial: 1,
        min: 1,
      }),
      timeIncrement: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
        trim: true,
      }),
    }
  }
}
