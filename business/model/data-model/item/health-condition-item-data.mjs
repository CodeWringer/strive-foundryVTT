import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";
import BaseItemData from "./base-item-data.mjs";

export default class HealthConditionItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      current: new FoundrySchemaFields.NumberField({
        nullable: false,
        integer: true,
        initial: 1,
        min: 1,
      }),
      maximum: new FoundrySchemaFields.NumberField({
        nullable: true,
        integer: true,
        initial: null,
      }),
    }
  }
}
