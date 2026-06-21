import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";
import ComplicationField from "../../data-field/complication-field.mjs";
import ReferenceField from "../../data-field/reference-field.mjs";
import TimeIncrementField from "../../data-field/time-increment-field.mjs";

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
      complications: new FoundrySchemaFields.ArrayField(new ComplicationField(), {
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
      projectSkill: new ReferenceField(),
      quality: new FoundrySchemaFields.NumberField({
        nullable: false,
        integer: true,
        positive: true,
        initial: 1,
        min: 1,
      }),
      timeIncrement: new TimeIncrementField(),
      product: new ReferenceField(),
    }
  }
}
