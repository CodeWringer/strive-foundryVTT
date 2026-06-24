import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";
import { ILLNESS_STATES } from "../../const/illness-states.mjs";
import ReferenceField from "../../data-field/reference-field.mjs";
import BaseItemData from "./base-item-data.mjs";

export default class IllnessItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      state: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: ILLNESS_STATES.active.name,
      }),
      treatment: new FoundrySchemaFields.SchemaField({
        lastTreatmentTime: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "",
          trim: true,
        }),
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
          positive: true,
          initial: 0,
          min: 0,
        }),
        required: new FoundrySchemaFields.NumberField({
          nullable: true,
          integer: true,
          positive: true,
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
