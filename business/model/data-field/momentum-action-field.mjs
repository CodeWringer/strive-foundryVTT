import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares a Momentum Action. 
 * 
 * @property {Object} desperate
 * @property {String} desperate.name
 * @property {Number} desperate.cost
 * @property {String} desperate.description
 * @property {Object} heroic
 * @property {String} heroic.name
 * @property {Number} heroic.cost
 * @property {String} heroic.description
 */
export default class MomentumActionField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      desperate: new FoundrySchemaFields.SchemaField({
        name: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "New Desperate Measure", //TODO loca
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
          initial: "New Heroic Act", //TODO loca
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