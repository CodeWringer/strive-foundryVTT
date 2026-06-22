import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";
import MomentumActionField from "../../data-field/momentum-action-field.mjs";

export default class TraitItemData extends TypeDataModel {
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
      momentumActions: new FoundrySchemaFields.ArrayField(new MomentumActionField(), {
        nullable: false,
        initial: [],
      }),
    }
  }
}
