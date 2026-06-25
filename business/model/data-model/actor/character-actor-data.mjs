import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs"
import AdvancementHistoryEntryField from "../../data-field/advancement-history-entry-field.mjs"
import AssetSlotField from "../../data-field/asset-slot-field.mjs"
import CharacterAttributeField from "../../data-field/character-attribute-field.mjs"
import DriverHistoryEntryField from "../../data-field/driver-history-entry-field.mjs"
import InjuryShrugOffField from "../../data-field/injury-shrug-off-field.mjs"
import ModifierField from "../../data-field/modifier-field.mjs"
import PropertyLocationField from "../../data-field/property-location-field.mjs"
import ReferenceField from "../../data-field/reference-field.mjs"

export default class CharacterActorData extends TypeDataModel {
  /** @override @see https://foundryvtt.com/api/classes/foundry.abstract.TypeDataModel.html#defineschema */
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
      attributes: new FoundrySchemaFields.ArrayField(new CharacterAttributeField(), {
        nullable: false,
        initial: [],
      }),
      actionPoints: new FoundrySchemaFields.SchemaField({
        current: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
        maximum: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          positive: true,
          initial: 5,
          min: 0,
        }),
      }),
      meta: new FoundrySchemaFields.SchemaField({
        actionPoints: new FoundrySchemaFields.SchemaField({
          refill: new FoundrySchemaFields.SchemaField({
            amount: new FoundrySchemaFields.NumberField({
              nullable: false,
              required: true,
              integer: true,
              positive: true,
              initial: 4,
              min: 0,
            }),
            enabled: new FoundrySchemaFields.BooleanField({
              nullable: false,
              required: true,
              initial: true,
            }),
          }),
        }),
        initiative: new FoundrySchemaFields.SchemaField({
          perTurn: new FoundrySchemaFields.NumberField({
            nullable: false,
            required: true,
            integer: true,
            positive: true,
            initial: 1,
            min: 1,
          }),
        }),
        itemOrders: new FoundrySchemaFields.SchemaField({
          languages: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
            nullable: false,
            initial: [],
          }),
          skills: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
            nullable: false,
            initial: [],
          }),
          injuries: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
            nullable: false,
            initial: [],
          }),
          illnesses: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
            nullable: false,
            initial: [],
          }),
          mutations: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
            nullable: false,
            initial: [],
          }),
          luggage: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
            nullable: false,
            initial: [],
          }),
          projects: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
            nullable: false,
            initial: [],
          }),
          recipes: new FoundrySchemaFields.ArrayField(new ReferenceField(), {
            nullable: false,
            initial: [],
          }),
        }),
        isPlayerCharacter: new FoundrySchemaFields.BooleanField({
          nullable: false,
          initial: false,
        }),
      }),
      personals: new FoundrySchemaFields.SchemaField({
        age: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "",
          trim: true,
        }),
        ancestry: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "",
          trim: true,
        }),
        genderOrPronouns: new FoundrySchemaFields.StringField({
          nullable: false,
          required: true,
          initial: "",
          trim: true,
        }),
      }),
      virtuesAndVices: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField({
          nullable: false,
          required: true,
          initial: true,
        }),
        arrogantOrHumble: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
        cowardlyOrCourageous: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
        cruelOrMerciful: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
        deceitfulOrHonest: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
        lazyOrEnergetic: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
        paranoidOrNaive: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
        recklessOrPrudent: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
        selfishOrConsiderate: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
        vengefulOrForgiving: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          min: -2,
          max: 2,
          initial: 0,
        }),
      }),
      drivers: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField({
          nullable: false,
          required: true,
          initial: true,
        }),
        ambition: new FoundrySchemaFields.SchemaField({
          current: new FoundrySchemaFields.HTMLField({
            blank: true,
            nullable: false,
            initial: "",
          }),
          history: new FoundrySchemaFields.ArrayField(new DriverHistoryEntryField(), {
            nullable: false,
            initial: [],
          }),
        }),
        aspirations: new FoundrySchemaFields.SchemaField({
          _0: new FoundrySchemaFields.HTMLField({
            blank: true,
            nullable: false,
            initial: "",
          }),
          _1: new FoundrySchemaFields.HTMLField({
            blank: true,
            nullable: false,
            initial: "",
          }),
          _2: new FoundrySchemaFields.HTMLField({
            blank: true,
            nullable: false,
            initial: "",
          }),
          history: new FoundrySchemaFields.ArrayField(new DriverHistoryEntryField(), {
            nullable: false,
            initial: [],
          }),
        }),
        reactions: new FoundrySchemaFields.SchemaField({
          _0: new FoundrySchemaFields.HTMLField({
            blank: true,
            nullable: false,
            initial: "",
          }),
          _1: new FoundrySchemaFields.HTMLField({
            blank: true,
            nullable: false,
            initial: "",
          }),
          _2: new FoundrySchemaFields.HTMLField({
            blank: true,
            nullable: false,
            initial: "",
          }),
          history: new FoundrySchemaFields.ArrayField(new DriverHistoryEntryField(), {
            nullable: false,
            initial: [],
          }),
        }),
      }),
      health: new FoundrySchemaFields.SchemaField({
        hp: new FoundrySchemaFields.SchemaField({
          current: new FoundrySchemaFields.NumberField({
            nullable: false,
            integer: true,
            positive: true,
            initial: 0,
            min: 0,
          }),
          temporary: new FoundrySchemaFields.NumberField({
            nullable: false,
            integer: true,
            positive: true,
            initial: 0,
            min: 0,
          }),
        }),
        stamina: new FoundrySchemaFields.SchemaField({
          current: new FoundrySchemaFields.NumberField({
            nullable: false,
            integer: true,
            positive: true,
            initial: 0,
            min: 0,
          }),
          strain: new FoundrySchemaFields.NumberField({
            nullable: false,
            integer: true,
            positive: true,
            initial: 0,
            min: 0,
          }),
        }),
        gritPoints: new FoundrySchemaFields.SchemaField({
          enabled: new FoundrySchemaFields.BooleanField({
            nullable: false,
            required: true,
            initial: true,
          }),
          current: new FoundrySchemaFields.NumberField({
            nullable: false,
            required: true,
            integer: true,
            positive: true,
            initial: 0,
            min: 0,
          }),
        }),
        injuryShrugOffs: new FoundrySchemaFields.ArrayField(new InjuryShrugOffField(), {
          nullable: false,
          initial: [],
        }),
        deathSaves: new FoundrySchemaFields.SchemaField({
          enabled: new FoundrySchemaFields.BooleanField({
            nullable: false,
            required: true,
            initial: true,
          }),
          current: new FoundrySchemaFields.NumberField({
            nullable: false,
            required: true,
            integer: true,
            positive: true,
            initial: 0,
            min: 0,
          }),
        }),
      }),
      assets: new FoundrySchemaFields.SchemaField({
        slots: new FoundrySchemaFields.ArrayField(new AssetSlotField(), {
          nullable: false,
          initial: [],
        }),
        luggage: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.StringField, {
          nullable: false,
          initial: [],
        }),
        property: new FoundrySchemaFields.SchemaField({
          unknownLocation: new PropertyLocationField(),
          locations: new FoundrySchemaFields.ArrayField(new PropertyLocationField(), {
            nullable: false,
            initial: [],
          }),
        }),
      }),
      advancement: new FoundrySchemaFields.SchemaField({
        enabled: new FoundrySchemaFields.BooleanField({
          nullable: false,
          required: true,
          initial: true,
        }),
        xp: new FoundrySchemaFields.NumberField({
          nullable: false,
          required: true,
          integer: true,
          positive: true,
          initial: 0,
          min: 0,
        }),
        history: new FoundrySchemaFields.ArrayField(new AdvancementHistoryEntryField(), {
          nullable: false,
          initial: [],
        }),
      }),
      modifiers: new FoundrySchemaFields.SchemaField({
        own: new FoundrySchemaFields.ArrayField(new ModifierField(), {
          nullable: false,
          initial: [],
        }),
      }),
    }
  }
}
