import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";

export default class InjuryItemData extends TypeDataModel {
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
      lastTreatmentTime: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
        trim: true,
      }),
      obstacleTreatment: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
        trim: true,
      }),
      requiredSupplies: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
        trim: true,
      }),
      state: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "active",
      }),
      healProgress: new FoundrySchemaFields.SchemaField({
        current: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
        required: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
      }),
      treatmentSkill: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
        trim: true,
      }),
    }
  }
}
