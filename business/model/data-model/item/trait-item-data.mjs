import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";
import MomentumActionField from "../../data-field/momentum-action-field.mjs";
import BaseItemData from "./base-item-data.mjs";

export default class TraitItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      momentumActions: new FoundrySchemaFields.ArrayField(new MomentumActionField(), {
        nullable: false,
        initial: [],
      }),
    }
  }
}
