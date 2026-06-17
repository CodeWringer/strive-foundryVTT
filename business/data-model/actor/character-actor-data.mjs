import { FoundrySchemaFields, TypeDataModel } from "../../../foundry-interop/data-model-wrapper.mjs";

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
        ambition: new FoundrySchemaFields.HTMLField({
          blank: true,
          nullable: false,
          initial: "",
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
        }),
      }),
      attributes: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
        nullable: false,
        initial: [],
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
        conditions: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
        injuryShrugOffs: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
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
        slots: new FoundrySchemaFields.SchemaField({
          back: new FoundrySchemaFields.SchemaField({
            alotted: new FoundrySchemaFields.DocumentUUIDField({
              nullable: true,
              embedded: true,
            }),
            maxBulk: new FoundrySchemaFields.NumberField({
              nullable: false,
              required: true,
              integer: true,
              positive: true,
              initial: 4,
              min: 0,
            }),
            position: new FoundrySchemaFields.SchemaField({
              x: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: 0,
                min: 0,
              }),
              y: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: -50,
                min: 0,
              }),
            }),
          }),
          clothing: new FoundrySchemaFields.SchemaField({
            alotted: new FoundrySchemaFields.DocumentUUIDField({
              nullable: true,
              embedded: true,
            }),
            maxBulk: new FoundrySchemaFields.NumberField({
              nullable: false,
              required: true,
              integer: true,
              positive: true,
              initial: 4,
              min: 0,
            }),
            position: new FoundrySchemaFields.SchemaField({
              x: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: 0,
                min: 0,
              }),
              y: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: 50,
                min: 0,
              }),
            }),
          }),
          armor: new FoundrySchemaFields.SchemaField({
            alotted: new FoundrySchemaFields.DocumentUUIDField({
              nullable: true,
              embedded: true,
            }),
            maxBulk: new FoundrySchemaFields.NumberField({
              nullable: false,
              required: true,
              integer: true,
              positive: true,
              initial: 4,
              min: 0,
            }),
            position: new FoundrySchemaFields.SchemaField({
              x: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: 0,
                min: 0,
              }),
              y: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: 50,
                min: 100,
              }),
            }),
          }),
          handLeft: new FoundrySchemaFields.SchemaField({
            alotted: new FoundrySchemaFields.DocumentUUIDField({
              nullable: true,
              embedded: true,
            }),
            maxBulk: new FoundrySchemaFields.NumberField({
              nullable: false,
              required: true,
              integer: true,
              positive: true,
              initial: 4,
              min: 0,
            }),
            position: new FoundrySchemaFields.SchemaField({
              x: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: -100,
                min: 0,
              }),
              y: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: 50,
                min: 0,
              }),
            }),
          }),
          handRight: new FoundrySchemaFields.SchemaField({
            alotted: new FoundrySchemaFields.DocumentUUIDField({
              nullable: true,
              embedded: true,
            }),
            maxBulk: new FoundrySchemaFields.NumberField({
              nullable: false,
              required: true,
              integer: true,
              positive: true,
              initial: 4,
              min: 0,
            }),
            position: new FoundrySchemaFields.SchemaField({
              x: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: 100,
                min: 0,
              }),
              y: new FoundrySchemaFields.NumberField({
                nullable: false,
                required: true,
                integer: true,
                positive: true,
                initial: 50,
                min: 0,
              }),
            }),
          }),
        })
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
      }),
      itemsOrder: new FoundrySchemaFields.SchemaField({
        languages: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
        skills: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
        injuries: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
        illnesses: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
        mutations: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
        luggage: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
        projects: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
        recipes: new FoundrySchemaFields.ArrayField(new FoundrySchemaFields.ObjectField(), {
          nullable: false,
          initial: [],
        }),
      }),
    }
  }
}
