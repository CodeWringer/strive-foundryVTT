import { StringUtil } from "../../../common/util/string-utility.mjs";
import { UuidUtil } from "../../../common/util/uuid-utility.mjs";
import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import GradedEffectField from "./graded-effect-field.mjs";

/**
 * Declares an Expertise. 
 * 
 * @property {FoundrySchemaFields.StringField} id 
 * @property {FoundrySchemaFields.StringField} img 
 * @property {FoundrySchemaFields.StringField} name 
 * @property {FoundrySchemaFields.HTMLField} description 
 * @property {FoundrySchemaFields.HTMLField} gmNotes 
 * @property {FoundrySchemaFields.NumberField} requiredLevel 
 * @property {FoundrySchemaFields.SchemaField} itemOrders 
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
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class ExpertiseField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      id: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: UuidUtil.createUuid(),
      }),
      img: new FoundrySchemaFields.StringField({
        nullable: false,
        initial: "",
      }),
      name: new FoundrySchemaFields.StringField({
        nullable: false,
        initial: StringUtil.getLoca("system.item.expertise.defaultName"),
      }),
      description: new FoundrySchemaFields.HTMLField({
        blank: true,
        nullable: false,
        initial: "",
      }),
      gmNotes: new FoundrySchemaFields.HTMLField({
        nullable: true,
      }),
      requiredLevel: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        integer: true,
        initial: 0,
        min: 0,
      }),
      itemOrders: new FoundrySchemaFields.SchemaField({}),
      actionPoints: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
      }),
      distance: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        current: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
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
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
