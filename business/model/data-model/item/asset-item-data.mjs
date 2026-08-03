import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";
import ComplicationField from "../../data-field/complication-field.mjs";
import BaseItemData from "./base-item-data.mjs";

export default class AssetItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      bulk: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 0,
        integer: true,
        min: 0,
      }),
      quantity: new FoundrySchemaFields.SchemaField({
        current: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          initial: 0,
          integer: true,
          min: 0,
        }),
        maximum: new FoundrySchemaFields.NumberField({
          nullable: true,
          required: false,
          initial: null,
          integer: true,
          min: 0,
        }),
      }),
      quality: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 1,
        integer: true,
        min: 1,
      }),
      complications: new FoundrySchemaFields.ArrayField(new ComplicationField(), {
        nullable: false,
        initial: [],
      }),
    }
  }
}
