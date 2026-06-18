import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";

export default class SkillItemData extends TypeDataModel {
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
      baseAttributes: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
        nullable: false,
        initial: [],
      }),
      level: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        integer: true,
        positive: true,
        initial: 0,
        min: 0,
      }),
      advancementProgress: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        integer: true,
        positive: true,
        initial: 0,
        min: 0,
      }),
      expertises: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
        nullable: false,
        initial: [],
      }),
      expertisesOrder: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
        nullable: false,
        initial: [],
      }),
      tags: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
        nullable: false,
        initial: [],
      }),
    }
  }
}
