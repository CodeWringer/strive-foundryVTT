import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import GradedEffectField from "./graded-effect-field.mjs";
import MomentumActionField from "./momentum-action-field.mjs";
import ReferenceField from "./reference-field.mjs";

/**
 * Declares an Expertise. 
 * 
 * @property {FoundrySchemaFields.HTMLField} description 
 * @property {FoundrySchemaFields.HTMLField} gmNotes 
 * @property {FoundrySchemaFields.NumberField} requiredLevel 
 * @property {FoundrySchemaFields.SchemaField} itemOrders 
 * @property {FoundrySchemaFields.ArrayField<ReferenceField>} itemOrders.momentumActions 
 * @property {FoundrySchemaFields.SchemaField} actionPoints 
 * @property {FoundrySchemaFields.BooleanField} actionPoints.enabled 
 * @property {FoundrySchemaFields.NumberField} actionPoints.current 
 * @property {FoundrySchemaFields.SchemaField} distance 
 * @property {FoundrySchemaFields.BooleanField} distance.enabled 
 * @property {FoundrySchemaFields.NumberField} distance.current 
 * @property {FoundrySchemaFields.SchemaField} targetingType 
 * @property {FoundrySchemaFields.BooleanField} targetingType.enabled 
 * @property {FoundrySchemaFields.StringField} targetingType.current 
 * @property {FoundrySchemaFields.SchemaField} obstacle 
 * @property {FoundrySchemaFields.BooleanField} obstacle.enabled 
 * @property {FoundrySchemaFields.StringField} obstacle.current 
 * @property {FoundrySchemaFields.SchemaField} opposedBy 
 * @property {FoundrySchemaFields.BooleanField} opposedBy.enabled 
 * @property {FoundrySchemaFields.StringField} opposedBy.current 
 * @property {FoundrySchemaFields.SchemaField} gradedEffects 
 * @property {FoundrySchemaFields.BooleanField} gradedEffects.enabled 
 * @property {FoundrySchemaFields.ArrayField<GradedEffectField>} gradedEffects.entries 
 * @property {FoundrySchemaFields.ArrayField<MomentumActionField>} momentumActions 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
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
        initial: 0,
        min: 0,
      }),
      itemOrders: new FoundrySchemaFields.SchemaField({
        momentumActions: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
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
