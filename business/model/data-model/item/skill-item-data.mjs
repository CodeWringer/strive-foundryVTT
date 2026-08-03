import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs";
import ExpertiseField from "../../data-field/expertise-field.mjs";
import GradedEffectField from "../../data-field/graded-effect-field.mjs";
import MomentumActionField from "../../data-field/momentum-action-field.mjs";
import ReferenceField from "../../data-field/reference-field.mjs";
import BaseItemData from "./base-item-data.mjs";

export default class SkillItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      baseAttributes: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.StringField(), {
        nullable: false,
        initial: [],
      }),
      level: new FoundrySchemaFields.NumberField({
        nullable: false,
        required: true,
        integer: true,
        initial: 0,
        min: 0,
      }),
      expertises: new FoundrySchemaFields.ArrayField(new ExpertiseField(), {
        nullable: false,
        initial: [],
      }),
      itemOrders: new FoundrySchemaFields.SchemaField({
        expertises: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
          nullable: false,
          initial: [],
        }),
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
      advancement: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField(),
        progress: new FoundrySchemaFields.NumberField({
          nullable: false,
          integer: true,
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
      isInnate: new FoundrySchemaFields.BooleanField({
        nullable: false,
        initial: false,
      }),
    };
  }
}
