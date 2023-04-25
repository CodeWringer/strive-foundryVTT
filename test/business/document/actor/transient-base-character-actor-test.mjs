import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
export class FormApplication {}
import TransientBaseCharacterActor from '../../../../business/document/actor/transient-base-character-actor.mjs';

describe("TransientBaseCharacterActor", () => {
  let actorDocument = {};

  beforeEach(() => {
    actorDocument = {
      system: {
        person: {
          age: 0,
          species: "",
          culture: "",
          sex: "",
          appearance: "",
          biography: ""
        },
        personalityTraits: {
          arrogantOrHumble: 0,
          cowardlyOrCourageous: 0,
          cruelOrMerciful: 0,
          deceitfulOrHonest: 0,
          lazyOrEnergetic: 0,
          paranoidOrNaive: 0,
          recklessOrPrudent: 0,
          selfishOrConsiderate: 0,
          vengefulOrForgiving: 0
        },
        attributes: {
          physical: {
            agility: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            },
            endurance: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            },
            perception: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            },
            strength: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            },
            toughness: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            }
          },
          mental: {
            intelligence: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            },
            wisdom: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            },
            arcana: {
              level: 0,
              moddedLevel: 0,
              progress: 0
            }
          },
          social: {
            empathy: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            },
            oratory: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            },
            willpower: {
              level: 1,
              moddedLevel: 0,
              progress: 0
            }
          }
        },
        health: {
          maxHP: 0,
          HP: 0,
          exhaustion: 0,
          magicStamina: 0,
          states: []
        },
        "assets": {
          "equipment": {
            "b0fed8b3-1aa4-4b8e-a150-7c2fb647fe7e": {
              "name": "clothing",
              "slots": {
                "458e47e6-f6ce-4841-83b2-0ac05c160a52": {
                  "name": "clothing",
                  "acceptedTypes": ["clothing"],
                  "alottedId": null,
                  "maxBulk": 4
                }
              }
            },
            "5af8c4db-de4a-4d2f-a3ed-9f8f18233cc5": {
              "name": "armor",
              "slots": {
                "16b24ed7-de48-46fd-8849-82d7b2648b8d": {
                  "name": "armor",
                  "acceptedTypes": ["armor"],
                  "alottedId": null,
                  "maxBulk": 4
                }
              }
            },
            "d7c46adc-848a-4fc9-a73d-a3ba37c18cb3": {
              "name": "hand",
              "slots": {
                "5321c233-8aef-43a5-b6a0-3b3309d31732": {
                  "name": "hand",
                  "acceptedTypes": ["holdable"],
                  "alottedId": null,
                  "maxBulk": 2
                },
                "6348fbf9-0ec1-4dea-b6c7-d3a650c5a313": {
                  "name": "hand",
                  "acceptedTypes": ["holdable"],
                  "alottedId": null,
                  "maxBulk": 2
                }
              }
            },
            "4f44dbc4-8fd4-486d-a6d0-16d8b7642852": {
              "name": "back",
              "slots": {
                "112d2056-8754-48e3-bad0-31a6ef5d6a38": {
                  "name": "back",
                  "acceptedTypes": ["holdable", "strappable"],
                  "alottedId": null,
                  "maxBulk": 4
                }
              }
            }
          },
          luggage: []
        }
      },
      update: sinon.fake(),
    };
    globalThis.game = {
      actors: MigratorTestBase.createMockWorldCollection("Actor", actors),
      packs: MigratorTestBase.createMockWorldCollection("Pack"),
      items: MigratorTestBase.createMockWorldCollection("Item"),
      journal: MigratorTestBase.createMockWorldCollection("Journal"),
      tables: MigratorTestBase.createMockWorldCollection("RollTable"),
      ambersteel: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
      i18n: {
        localize: sinon.fake(),
      },
    };
  });
  
  // Doesn't work - global scoped class "FormApplication" does not exist, but is required!
  // it("constructs as expected", () => {
  //   // When
  //   const r = new TransientBaseCharacterActor(actorDocument);
  //   // Then
  //   r.should.not.be.undefined();
  // });
});