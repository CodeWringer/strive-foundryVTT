import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";

/**
 * Declares a Momentum Action. 
 * 
 * @property {FoundrySchemaFields.SchemaField} desperate
 * @property {FoundrySchemaFields.StringField} desperate.img
 * @property {FoundrySchemaFields.StringField} desperate.name
 * @property {FoundrySchemaFields.NumberField} desperate.cost
 * @property {FoundrySchemaFields.StringField} desperate.description
 * @property {FoundrySchemaFields.SchemaField} heroic
 * @property {FoundrySchemaFields.StringField} heroic.name
 * @property {FoundrySchemaFields.StringField} heroic.img
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
          initial: StringUtil.getLoca("system.item.momentumAction.desperate.defaultName"),
        }),
        img: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "systems/strive/presentation/image/desperate-measure.svg",
        }),
        momentumChange: new FoundrySchemaFields.NumberField({
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
          initial: StringUtil.getLoca("system.item.momentumAction.heroic.defaultName"),
        }),
        img: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "systems/strive/presentation/image/heroic-act.svg",
        }),
        momentumChange: new FoundrySchemaFields.NumberField({
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