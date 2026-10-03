import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs"
import ReferenceField from "../../data-field/reference-field.mjs"
import BaseItemData from "./base-item-data.mjs"

export default class IllnessItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      treatment: new FoundrySchemaFields.SchemaField({
        obstacle: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "",
          trim: true,
        }),
        skill: new ReferenceField(),
        requiredSupplies: new FoundrySchemaFields.SchemaField({
          amount: new FoundrySchemaFields.NumberField({
            nullable: false,
            required: true,
            initial: 0,
            integer: true,
            min: 0,
          }),
          asset: new ReferenceField(),
        }),
      }),
      healProgress: new FoundrySchemaFields.SchemaField({
        current: new FoundrySchemaFields.NumberField({
          nullable: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
        required: new FoundrySchemaFields.NumberField({
          nullable: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
        untilCured: new FoundrySchemaFields.BooleanField({
          nullable: false,
          initial: false,
        }),
      }),
    }
  }
}
