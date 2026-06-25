import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares a Momentum Action. 
 * 
 * @property {FoundrySchemaFields.SchemaField} desperate
 * @property {FoundrySchemaFields.StringField} desperate.name
 * @property {FoundrySchemaFields.NumberField} desperate.cost
 * @property {FoundrySchemaFields.StringField} desperate.description
 * @property {FoundrySchemaFields.SchemaField} heroic
 * @property {FoundrySchemaFields.StringField} heroic.name
 * @property {FoundrySchemaFields.NumberField} heroic.cost
 * @property {FoundrySchemaFields.StringField} heroic.description
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class MomentumActionField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      desperate: new FoundrySchemaFields.SchemaField({
        name: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "New Desperate Measure", // TODO loca
        }),
        cost: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          initial: 0,
          integer: true,
        }),
        description: new FoundrySchemaFields.HTMLField({
          nullable: false,
          required: true,
          initial: "",
        }),
      }),
      heroic: new FoundrySchemaFields.SchemaField({
        name: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "New Heroic Act", // TODO loca
        }),
        cost: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          initial: 0,
          integer: true,
        }),
        description: new FoundrySchemaFields.HTMLField({
          nullable: false,
          required: true,
          initial: "",
        }),
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}