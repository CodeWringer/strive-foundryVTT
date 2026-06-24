import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";
import BaseItemData from "./base-item-data.mjs";

export default class FateCardItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
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
