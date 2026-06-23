import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import GradedEffectField from "./graded-effect-field.mjs";
import MomentumActionField from "./momentum-action-field.mjs";

export default class ExpertiseField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      description: new FoundrySchemaFields.HTMLField({
        blank: true,
        nullable: false,
        initial: "",
      }),
      gmNotes: new FoundrySchemaFields.HTMLField(),
      requiredLevel: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        integer: true,
        positive: true,
        initial: 0,
        min: 0,
      }),
      itemOrders: new FoundrySchemaFields.SchemaField({
        momentumActions: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.StringField(), {
          nullable: false,
          initial: [],
        }),
      }),
      actionPoints: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.NumberField({
          min: 0,
          initial: 0,
          integer: true,
        }),
      }),
      distance: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.StringField({}),
      }),
      targetingType: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.StringField({}),
      }),
      obstacle: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.StringField({}),
      }),
      opposedBy: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.StringField({}),
      }),
      advancement: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        progress: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
      }),
      gradedEffects: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        entries: new FoundrySchemaFields.ArrayField(new GradedEffectField()),
      }),
      momentumActions: new FoundrySchemaFields.ArrayField(new MomentumActionField(), {
        nullable: false,
        initial: [],
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
