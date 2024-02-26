import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { WorldSystemVersion } from '../../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';
import Migrator_1_5_4__1_5_5 from '../../../../business/migration/migrators/migrator_1-5-4_1-5-5.mjs';
import { BaseLoggingStrategy } from '../../../../business/logging/base-logging-strategy.mjs';
import { DOCUMENT_COLLECTION_SOURCES } from '../../../../business/document/document-fetcher/document-collection-source.mjs';

/**
 * Creates a new mock document of type "Actor" and returns it. 
 * 
 * @param {String} id
 * @param {String} name
 * @param {String} type `"pc"` | `"npc"` | `"plain"`
 * @param {Object | undefined} systemData Contents of the `data.data` or 
 * `system` property. 
 * @param {Boolean | undefined} isPreV10 If `true`, this "document" is to be 
 * created with FoundryVTT's data model prior to version 10. 
 * 
 * This allows simulating cases of older versions of FoundryVTT 
 * still being in use. 
 * * Default `false`.
 * 
 * @returns {Object} An object that represents a FoundryVTT 
 * document instance. 
 */
function createMockDocumentActor(id, name, type, systemData = {}, isPreV10 = false) {
  let dataProperty = {
    system: {}
  };

  if (type !== "plain") {
    if (isPreV10 === true) {
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
  }

  return {
    id: id,
    name: name,
    type: type,
    ...dataProperty,
    update: sinon.fake(),
  };
}

function createOldAttributeData() {
  return {
    attributes: {
      physical: {
        agility: {
          successes: 1,
          failures: 2,
        },
        endurance: {
          successes: 3,
          failures: 4,
        },
        perception: {
          successes: 5,
          failures: 6,
        },
        strength: {
          successes: 7,
          failures: 8,
        },
        toughness: {
          successes: 9,
          failures: 10,
        },
      },
      mental: {
        intelligence: {
          successes: 11,
          failures: 12,
        },
        wisdom: {
          successes: 13,
          failures: 14,
        },
        arcana: {
          successes: 15,
          failures: 16,
        },
      },
      social: {
        empathy: {
          successes: 17,
          failures: 18,
        },
        oratory: {
          successes: 19,
          failures: 20,
        },
        willpower: {
          successes: 21,
          failures: 22,
        },
      },
    }
  };
}

function createNewAttributeData() {
  return {
    attributes: {
      physical: {
        agility: {
          progress: 2,
        },
        endurance: {
          progress: 4,
        },
        perception: {
          progress: 6,
        },
        strength: {
          progress: 8,
        },
        toughness: {
          progress: 10,
        },
      },
      mental: {
        intelligence: {
          progress: 12,
        },
        wisdom: {
          progress: 14,
        },
        arcana: {
          progress: 16,
        },
      },
      social: {
        empathy: {
          progress: 18,
        },
        oratory: {
          progress: 20,
        },
        willpower: {
          progress: 22,
        },
      },
    }
  };
}

function createOldHealthData() {
  return {
    health: {
      states: ["berserk", "dazed", "electrified"]
    }
  }
}

function createNewHealthData() {
  return {
    health: {
      states: ["berserk", "exhausted", "electrified"]
    }
  }
}

describe("Migrator_1_5_4__1_5_5", () => {
  /**
   * Plain actor
   */
  const actorIdPlain = "actorIdPlain";
  /**
   * NPC pre-v10; Old data
   */
  const actorIdNpcPreV10_1 = "actorIdNpcPreV10_1";
  /**
   * NPC post-v10; Old data
   */
  const actorIdNpcPostV10_1 = "actorIdNpcPostV10_1";
  /**
   * NPC post-v10; New data
   */
  const actorIdNpcPostV10_2 = "actorIdNpcPostV10_2";
  /**
   * PC pre-v10; Old data
   */
  const actorIdPcPreV10_1 = "actorIdPcPreV10_1";
  /**
   * PC post-v10; Old data
   */
  const actorIdPcPostV10_1 = "actorIdPcPostV10_1";
  /**
   * PC post-v10; New data
   */
  const actorIdPcPostV10_2 = "actorIdPcPostV10_2";
  /**
   * ID of the "Throwing" skill. Must be kept synchronous with the actual 
   * ID of the skill! 
   */
  const throwingSkillId = "m9u2l71cg9791dwR";

  before(function () {
    const actors = [
      createMockDocumentActor(
        actorIdPlain,
        `name_${actorIdPlain}`,
        "plain",
      ),
      createMockDocumentActor(
        actorIdNpcPreV10_1,
        `name_${actorIdNpcPreV10_1}`,
        "npc",
        {
          ...createOldAttributeData(),
          ...createOldHealthData(),
        },
        true
      ),
      createMockDocumentActor(
        actorIdNpcPostV10_1,
        `name_${actorIdNpcPostV10_1}`,
        "npc",
        {
          ...createOldAttributeData(),
          ...createOldHealthData(),
        },
        false
      ),
      createMockDocumentActor(
        actorIdNpcPostV10_2,
        `name_${actorIdNpcPostV10_2}`,
        "npc",
        {
          ...createNewAttributeData(),
          ...createNewHealthData(),
        },
        false
      ),
      createMockDocumentActor(
        actorIdPcPreV10_1,
        `name_${actorIdPcPreV10_1}`,
        "pc",
        {
          ...createOldAttributeData(),
          ...createOldHealthData(),
        },
        true
      ),
      createMockDocumentActor(
        actorIdPcPostV10_1,
        `name_${actorIdPcPostV10_1}`,
        "pc",
        {
          ...createOldAttributeData(),
          ...createOldHealthData(),
        },
        false
      ),
      createMockDocumentActor(
        actorIdPcPostV10_2,
        `name_${actorIdPcPostV10_2}`,
        "pc",
        {
          ...createNewAttributeData(),
          ...createNewHealthData(),
        },
        false
      ),
    ];

    const packs = [
      {
        index: {
          size: 1,
          entries: [
            {
              _id: throwingSkillId
            }
          ],
          [Symbol.iterator]: function*() {
            return this.entries;
          },
        },
        metadata: {
          packageType: "system",
          type: "Item",
        },
        getDocument: (id) => {
          if (id === throwingSkillId) {
            return {
              id: throwingSkillId,
              name: "Throwing",
              type: "skill",
              img: "path/to/file.svg",
              system: {
                abilities: {},
                category: "category",
                description: "A description",
                displayOrders: {},
                headState: "full",
                gmNotes: "gm notes",
                properties: [],
                relatedAttribute: "agility",
                isCustom: false,
                level: 3,
                moddedLevel: 4,
                successes: 15,
                failures: 3,
              }
            }
          }
        }
      }
    ]

    globalThis.MIGRATORS = [];
    globalThis.game = {
      actors: MigratorTestBase.createMockWorldCollection("Actor", actors),
      packs: MigratorTestBase.createMockWorldCollection("Pack", packs),
      items: MigratorTestBase.createMockWorldCollection("Item"),
      journal: MigratorTestBase.createMockWorldCollection("Journal"),
      tables: MigratorTestBase.createMockWorldCollection("RollTable"),
      strive: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
    };
    
    MigratorTestBase.setup("1.5.4");
  });

  after(() => {
    globalThis.MIGRATORS = undefined;
    globalThis.game = undefined;
    MigratorTestBase.tearDown();
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_5_4__1_5_5();
    // Setup
    given._fetcher = sinon.stub(given.fetcher);
    given._fetcher.findAll = (args) => {
      if (args.documentType === "Actor"
      && args.source === DOCUMENT_COLLECTION_SOURCES.all
      && args.includeLocked === false) {
        return globalThis.game.actors.values();
      }
    };
    given._fetcher.find = (args) => {
      if (args.documentType === "Item"
      && args.id === throwingSkillId) {
        return globalThis.game.packs.values().next();
      }
    }

    MigratorTestBase.setup("1.5.4");
    // When
    await given.migrate();
    // Then
    WorldSystemVersion.get().should.deepEqual(new VersionCode(1, 5, 5))

    game.actors.get(actorIdPlain).update.should.not.have.been.called();
    
    game.actors.get(actorIdNpcPreV10_1).update.should.have.been.calledOnce();
    game.actors.get(actorIdNpcPreV10_1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              agility: {
                "-=successes": null,
                "-=failures": null,
                progress: 3,
              },
              endurance: {
                "-=successes": null,
                "-=failures": null,
                progress: 7,
              },
              perception: {
                "-=successes": null,
                "-=failures": null,
                progress: 11,
              },
              strength: {
                "-=successes": null,
                "-=failures": null,
                progress: 15,
              },
              toughness: {
                "-=successes": null,
                "-=failures": null,
                progress: 19,
              },
            },
            mental: {
              intelligence: {
                "-=successes": null,
                "-=failures": null,
                progress: 23,
              },
              wisdom: {
                "-=successes": null,
                "-=failures": null,
                progress: 27,
              },
              arcana: {
                "-=successes": null,
                "-=failures": null,
                progress: 31,
              },
            },
            social: {
              empathy: {
                "-=successes": null,
                "-=failures": null,
                progress: 35,
              },
              oratory: {
                "-=successes": null,
                "-=failures": null,
                progress: 39,
              },
              willpower: {
                "-=successes": null,
                "-=failures": null,
                progress: 43,
              },
            },
          },
          health: {
            states: ["berserk", "electrified", "exhausted"]
          }
        }
      }
    }, { render: false });
    
    game.actors.get(actorIdNpcPostV10_1).update.should.have.been.calledOnce();
    game.actors.get(actorIdNpcPostV10_1).update.should.have.been.calledWith({
      system: {
        attributes: {
          physical: {
            agility: {
              "-=successes": null,
              "-=failures": null,
              progress: 3,
            },
            endurance: {
              "-=successes": null,
              "-=failures": null,
              progress: 7,
            },
            perception: {
              "-=successes": null,
              "-=failures": null,
              progress: 11,
            },
            strength: {
              "-=successes": null,
              "-=failures": null,
              progress: 15,
            },
            toughness: {
              "-=successes": null,
              "-=failures": null,
              progress: 19,
            },
          },
          mental: {
            intelligence: {
              "-=successes": null,
              "-=failures": null,
              progress: 23,
            },
            wisdom: {
              "-=successes": null,
              "-=failures": null,
              progress: 27,
            },
            arcana: {
              "-=successes": null,
              "-=failures": null,
              progress: 31,
            },
          },
          social: {
            empathy: {
              "-=successes": null,
              "-=failures": null,
              progress: 35,
            },
            oratory: {
              "-=successes": null,
              "-=failures": null,
              progress: 39,
            },
            willpower: {
              "-=successes": null,
              "-=failures": null,
              progress: 43,
            },
          },
        },
        health: {
          states: ["berserk", "electrified", "exhausted"]
        }
      }
    }, { render: false });

    game.actors.get(actorIdNpcPostV10_2).update.should.not.have.been.called();
    game.strive.logger.logWarn.should.have.been.called();
    
    game.actors.get(actorIdPcPreV10_1).update.should.have.been.calledOnce();
    game.actors.get(actorIdPcPreV10_1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              agility: {
                "-=successes": null,
                "-=failures": null,
                progress: 3,
              },
              endurance: {
                "-=successes": null,
                "-=failures": null,
                progress: 7,
              },
              perception: {
                "-=successes": null,
                "-=failures": null,
                progress: 11,
              },
              strength: {
                "-=successes": null,
                "-=failures": null,
                progress: 15,
              },
              toughness: {
                "-=successes": null,
                "-=failures": null,
                progress: 19,
              },
            },
            mental: {
              intelligence: {
                "-=successes": null,
                "-=failures": null,
                progress: 23,
              },
              wisdom: {
                "-=successes": null,
                "-=failures": null,
                progress: 27,
              },
              arcana: {
                "-=successes": null,
                "-=failures": null,
                progress: 31,
              },
            },
            social: {
              empathy: {
                "-=successes": null,
                "-=failures": null,
                progress: 35,
              },
              oratory: {
                "-=successes": null,
                "-=failures": null,
                progress: 39,
              },
              willpower: {
                "-=successes": null,
                "-=failures": null,
                progress: 43,
              },
            },
          },
          health: {
            states: ["berserk", "electrified", "exhausted"]
          }
        }
      }
    }, { render: false });
    
    game.actors.get(actorIdPcPostV10_1).update.should.have.been.calledOnce();
    game.actors.get(actorIdPcPostV10_1).update.should.have.been.calledWith({
      system: {
        attributes: {
          physical: {
            agility: {
              "-=successes": null,
              "-=failures": null,
              progress: 3,
            },
            endurance: {
              "-=successes": null,
              "-=failures": null,
              progress: 7,
            },
            perception: {
              "-=successes": null,
              "-=failures": null,
              progress: 11,
            },
            strength: {
              "-=successes": null,
              "-=failures": null,
              progress: 15,
            },
            toughness: {
              "-=successes": null,
              "-=failures": null,
              progress: 19,
            },
          },
          mental: {
            intelligence: {
              "-=successes": null,
              "-=failures": null,
              progress: 23,
            },
            wisdom: {
              "-=successes": null,
              "-=failures": null,
              progress: 27,
            },
            arcana: {
              "-=successes": null,
              "-=failures": null,
              progress: 31,
            },
          },
          social: {
            empathy: {
              "-=successes": null,
              "-=failures": null,
              progress: 35,
            },
            oratory: {
              "-=successes": null,
              "-=failures": null,
              progress: 39,
            },
            willpower: {
              "-=successes": null,
              "-=failures": null,
              progress: 43,
            },
          },
        },
        health: {
          states: ["berserk", "electrified", "exhausted"]
        }
      }
    }, { render: false });

    game.actors.get(actorIdPcPostV10_2).update.should.not.have.been.called();
    game.strive.logger.logWarn.should.have.been.calledTwice();
  });
});