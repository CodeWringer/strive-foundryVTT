import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";
import TimeIncrementField from "../../data-field/time-increment-field.mjs";
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
        positive: true,
      }),
      quantity: new FoundrySchemaFields.SchemaField({
        current: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          initial: 1,
          integer: true,
          min: 0,
          positive: true,
        }),
        maximum: new FoundrySchemaFields.NumberField({
          nullable: true,
          required: false,
          initial: null,
          integer: true,
          min: 0,
          positive: true,
        }),
      }),
      quality: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        initial: 1,
        integer: true,
        min: 1,
        positive: true,
      }),
      crafting: new FoundrySchemaFields.SchemaField({
        progressIncrement: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          initial: 1,
          integer: true,
          min: 1,
          positive: true,
        }),
        timeIncrement: new TimeIncrementField(),
        amount: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          initial: 1,
          integer: true,
          min: 1,
          positive: true,
        }),
      }),
    }
  }
}
