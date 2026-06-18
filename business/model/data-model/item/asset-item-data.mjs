import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";

export default class AssetItemData extends TypeDataModel {
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
      bulk: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 0,
        integer: true,
        min: 0,
        positive: true,
      }),
      quantity: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 1,
        integer: true,
        min: 1,
        positive: true,
      }),
      maxQuantity: new FoundrySchemaFields.NumberField({
        nullable: true,
        required: false,
        initial: null,
        integer: true,
        min: 0,
        positive: true,
      }),
      quality: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 1,
        integer: true,
        min: 1,
        positive: true,
      }),
      location: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: "",
        trim: true,
      }),
    }
  }
}
