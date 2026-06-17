import { FoundrySchemaFields, TypeDataModel } from "../../../foundry-interop/data-model-wrapper.mjs";

export default class RecipeItemData extends TypeDataModel {
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
      requiredProgress: new FoundrySchemaFields.NumberField({
        nullable: false,
        integer: true,
        positive: true,
        initial: 0,
        min: 0,
      }),
      projectSkill: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
        trim: true,
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
