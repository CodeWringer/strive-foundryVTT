import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";

export default class FateCardItemData extends TypeDataModel {
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
      cost: new FoundrySchemaFields.SchemaField({
        miFP: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
        maFP: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
        AFP: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
      })
    }
  }
}
