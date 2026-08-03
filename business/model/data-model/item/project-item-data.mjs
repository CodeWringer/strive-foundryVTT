import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";
import ComplicationField from "../../data-field/complication-field.mjs";
import ReferenceField from "../../data-field/reference-field.mjs";
import TimeIncrementField from "../../data-field/time-increment-field.mjs";
import BaseItemData from "./base-item-data.mjs";

export default class ProjectItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      complications: new FoundrySchemaFields.ArrayField(new ComplicationField(), {
        nullable: false,
        initial: [],
      }),
      progress: new FoundrySchemaFields.SchemaField({
        current: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          initial: 0,
          min: 0,
        }),
        increment: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          initial: 0,
          min: 0,
        }),
        total: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          initial: 0,
          min: 0,
        }),
      }),
      projectSkill: new ReferenceField(),
      pushes: new FoundrySchemaFields.NumberField({
        nullable: false,
        integer: true,
        initial: 0,
        min: 0,
      }),
      quality: new FoundrySchemaFields.NumberField({
        nullable: false,
        integer: true,
        initial: 1,
        min: 1,
      }),
      timeIncrement: new TimeIncrementField(),
    }
  }
}
