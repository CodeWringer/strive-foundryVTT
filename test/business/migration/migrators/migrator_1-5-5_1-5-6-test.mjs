import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { WorldSystemVersion } from '../../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';
import { BaseLoggingStrategy } from '../../../../business/logging/base-logging-strategy.mjs';
import { DOCUMENT_COLLECTION_SOURCES } from '../../../../business/document/document-fetcher/document-collection-source.mjs';
import Migrator_1_5_5__1_5_6 from '../../../../business/migration/migrators/migrator_1-5-5_1-5-6.mjs';

/**
 * Creates a new mock document and returns it. 
 * 
 * @param {String} id
 * @param {String} name
 * @param {String} img
 * @param {String} type `"pc"` | `"npc"` | `"plain"` | `"skill"`
 * @param {String} foundryVersion The version of FoundryVTT to emulate. 
 * * Allowed values: `"<10"` | `"10"` | `"11"`
 * @param {Object | undefined} systemData Contents of the `data.data` or 
 * `system` property. 
 * @param {Array<Object> | undefined} embeddedItems An array of embedded items. 
 * 
 * @returns {Object} An object that represents a FoundryVTT 
 * document instance. 
 */
function createMockDocument(id, name, img, type, foundryVersion, systemData = {}, embeddedItems = []) {
  let dataProperty = {};

  if (foundryVersion === "<10") {
    dataProperty = {
      data: {
        data: {
          ...systemData
        }
      }
    }
  } else {
    dataProperty = {
      system: {
        ...systemData
      }
    }
  }

  return {
    id: id,
    name: name,
    type: type,
    img: img,
    ...dataProperty,
    update: sinon.fake(),
    delete: sinon.fake(),
    items: embeddedItems,
  };
}

describe("Migrator_1_5_5__1_5_6", () => {
  const fakeIntimidationSkillDefinition = createMockDocument(
    "R20ZqcGisZiBda3S",
    "Intimidation",
    "icons/svg/book.svg",
    "skill",
    "10",
    {
      abilities: [],
      category: "a category",
      description: "a description",
      displayOrders: [],
      headState: "full",
      gmNotes: "GM notes",
      properties: [],
      relatedAttribute: "Strength",
      isCustom: false,
    }
  );
  
  const fakeUnarmedCombatSkillDefinition = createMockDocument(
    "KUu7JGGtn0FNGsNw",
    "Unarmed Combat",
    "icons/svg/book.svg",
    "skill",
    "10",
    {
      abilities: [],
      category: "a category",
      description: "a description",
      displayOrders: [],
      headState: "full",
      gmNotes: "GM notes",
      properties: [],
      relatedAttribute: "Strength",
      isCustom: false,
    }
  );

  const idActorPlain = "idActorPlain";
  
  const idOldActorV10 = "idOldActorV10";
  const idNewActorV10 = "idNewActorV10";

  before((done) => {
    globalThis.MIGRATORS = [];
    globalThis.game = {
      actors: MigratorTestBase.createMockWorldCollection("Actor", [
        createMockDocument(
          idActorPlain,
          "A plain actor",
          "path/to/image.svg",
          "plain",
          "10",
          {}
        ),
        createMockDocument(
          idOldActorV10,
          "Old actor v10",
          "path/to/image.svg",
          "pc",
          "10",
          {
            attributes: {
              physical: {
                agility: {
                  level: 3,
                  moddedLevel: 3,
                },
                endurance: {
                  level: 3,
                  moddedLevel: 2,
                },
                perception: {
                  level: 3,
                  moddedLevel: 4,
                },
                strength: {
                  level: 5,
                  moddedLevel: 1,
                },
                toughness: {
                  level: 1,
                  moddedLevel: 3,
                },
              },
              mental: {
                intelligence: {
                  level: 1,
                  moddedLevel: 1,
                },
                wisdom: {
                  level: 1,
                  moddedLevel: 1,
                },
                arcana: {
                  level: 1,
                  moddedLevel: 1,
                },
              },
              social: {
                empathy: {
                  level: 1,
                  moddedLevel: 1,
                },
                oratory: {
                  level: 1,
                  moddedLevel: 1,
                },
                willpower: {
                  level: 1,
                  moddedLevel: 1,
                },
              },
            }
          },
          [
            createMockDocument(
              "R20ZqcGisZiBda3S",
              "Intimidation",
              "url",
              "skill",
              "10",
              {
                level: 3,
                moddedLevel: 3,
              }
            ),
            createMockDocument(
              "KUu7JGGtn0FNGsNw",
              "Weapon <Unarmed>",
              "url",
              "skill",
              "10",
              {
                level: 3,
                moddedLevel: 2,
              }
            ),
          ]
        ),
        createMockDocument(
          idNewActorV10,
          "New actor v10",
          "path/to/image.svg",
          "pc",
          "10",
          {
            attributes: {
              physical: {
                agility: {
                  level: 3,
                  levelModifier: 0,
                },
                endurance: {
                  level: 3,
                  levelModifier: -1,
                },
                perception: {
                  level: 3,
                  levelModifier: 1,
                },
                strength: {
                  level: 5,
                  levelModifier: 4,
                },
                toughness: {
                  level: 1,
                  levelModifier: 2,
                },
              },
              mental: {
                intelligence: {
                  level: 1,
                  levelModifier: 0,
                },
                wisdom: {
                  level: 1,
                  levelModifier: 0,
                },
                arcana: {
                  level: 1,
                  levelModifier: 0,
                },
              },
              social: {
                empathy: {
                  level: 1,
                  levelModifier: 0,
                },
                oratory: {
                  level: 1,
                  levelModifier: 0,
                },
                willpower: {
                  level: 1,
                  levelModifier: 0,
                },
              },
            }
          },
          [
            createMockDocument(
              "R20ZqcGisZiBda3S",
              "Intimidation",
              "url",
              "skill",
              "10",
              {
                level: 3,
                levelModifier: 0,
              }
            ),
            createMockDocument(
              "KUu7JGGtn0FNGsNw",
              "Weapon <Unarmed>",
              "url",
              "skill",
              "10",
              {
                level: 3,
                levelModifier: -1,
              }
            ),
          ]
        ),
      ]),
      packs: MigratorTestBase.createMockWorldCollection("Pack"),
      items: MigratorTestBase.createMockWorldCollection("Item"),
      journal: MigratorTestBase.createMockWorldCollection("Journal"),
      tables: MigratorTestBase.createMockWorldCollection("RollTable"),
      strive: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
    };
    
    MigratorTestBase.setup("1.5.5");
    
    done();
  });
  
  after((done) => {
    globalThis.MIGRATORS = undefined;
    MigratorTestBase.tearDown();

    done();
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_5_5__1_5_6();
    // Setup
    given._fetcher = sinon.stub(given.fetcher);
    given._fetcher.findAll = (args) => {
      if (
        args.documentType === "Actor"
        && args.source === DOCUMENT_COLLECTION_SOURCES.all
        && args.includeLocked === false
      ) {
        return globalThis.game.actors.values();
      }
    };
    given._fetcher.find = (args) => {
      if (
        args.name === "Intimidation"
        && args.source === DOCUMENT_COLLECTION_SOURCES.systemCompendia
      ) {
        return fakeIntimidationSkillDefinition;
      } else if (args.name === "Unarmed Combat") {
        return fakeUnarmedCombatSkillDefinition;
      }
    }

    // When
    await given.migrate();

    // Then
    WorldSystemVersion.get().should.deepEqual(new VersionCode(1, 5, 6));
    
    game.actors.get(idActorPlain).update.should.not.have.been.called();
    
    game.actors.get(idOldActorV10).update.should.have.been.calledWith({
      system: {
        attributes: {
          physical: {
            agility: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            endurance: {
              "-=moddedLevel": null,
              levelModifier: -1,
            },
            perception: {
              "-=moddedLevel": null,
              levelModifier: 1,
            },
            strength: {
              "-=moddedLevel": null,
              levelModifier: -4,
            },
            toughness: {
              "-=moddedLevel": null,
              levelModifier: 2,
            },
          },
          mental: {
            intelligence: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            wisdom: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            arcana: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
          },
          social: {
            empathy: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            oratory: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            willpower: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
          },
        }
      }
    }, { render: false });

    game.actors.get(idOldActorV10).items[0].update.should.have.been.calledWith({
      system: {
        "-=moddedLevel": null,
        levelModifier: 0,
      }
    }, { render: false });
    game.actors.get(idOldActorV10).items[1].update.should.have.been.calledWith({
      system: {
        "-=moddedLevel": null,
        levelModifier: -1,
      }
    }, { render: false });
    
    game.actors.get(idNewActorV10).update.should.have.been.calledWith({
      system: {
        attributes: {
          physical: {
            agility: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            endurance: {
              "-=moddedLevel": null,
              levelModifier: -1,
            },
            perception: {
              "-=moddedLevel": null,
              levelModifier: 1,
            },
            strength: {
              "-=moddedLevel": null,
              levelModifier: 4,
            },
            toughness: {
              "-=moddedLevel": null,
              levelModifier: 2,
            },
          },
          mental: {
            intelligence: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            wisdom: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            arcana: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
          },
          social: {
            empathy: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            oratory: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
            willpower: {
              "-=moddedLevel": null,
              levelModifier: 0,
            },
          },
        }
      }
    }, { render: false });

    game.actors.get(idNewActorV10).items[0].update.should.have.been.calledWith({
      system: {
        "-=moddedLevel": null,
        levelModifier: 0,
      }
    }, { render: false });
    game.actors.get(idNewActorV10).items[1].update.should.have.been.calledWith({
      system: {
        "-=moddedLevel": null,
        levelModifier: -1,
      }
    }, { render: false });
  });
});