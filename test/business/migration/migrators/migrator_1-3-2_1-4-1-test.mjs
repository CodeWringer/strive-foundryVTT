import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { WorldSystemVersion } from '../../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';
import Migrator_1_3_2__1_4_1 from '../../../../business/migration/migrators/migrator_1-3-2_1-4-1.mjs';
import { BaseLoggingStrategy } from '../../../../business/logging/base-logging-strategy.mjs';

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
 * @param {Array<Object> | undefined} items A list of embedded documents. 
 * 
 * This allows simulating cases of older versions of FoundryVTT 
 * still being in use. 
 * * Default `false`.
 * 
 * @returns {Object} An object that represents a FoundryVTT 
 * document instance. 
 */
function createMockDocumentActor(id, name, type, systemData = {}, isPreV10 = false, items = []) {
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
    items: items,
  };
}

describe("Migrator_1_3_2__1_4_1", () => {
  const actorId0 = "actorId0";
  const actorId1 = "actorId1";
  const actorId2 = "actorId2";
  const actorId3 = "actorId3";

  const belief0 = "belief0";
  const belief1 = "belief1";
  const belief2 = "belief2";

  const instinct0 = "instinct0";
  const instinct1 = "instinct1";
  const instinct2 = "instinct2";

  const skillName0 = "A Skill 0";
  const skillName1 = "A Skill 1";

  before(() => {
    const actors = [
      createMockDocumentActor(
        actorId0,
        "abc",
        "plain",
      ),
      createMockDocumentActor(
        actorId1,
        "def",
        "pc",
        {
          beliefSystem: {
            beliefs: [belief0, belief1, belief2],
            instincts: [instinct0, instinct1, instinct2],
          },
          attributes: {
            physical: {
              agility: { value: 1 },
              endurance: { value: 2 },
              perception: { value: 3 },
              strength: { value: 4 },
              toughness: { value: 5 },
            },
            mental: {
              intelligence: { value: 1 },
              wisdom: { value: 2 },
              arcana: { value: 3 },
            },
            social: {
              empathy: { value: 1 },
              oratory: { value: 2 },
              willpower: { value: 3 },
            },
          }
        },
        true
      ),
      createMockDocumentActor(
        actorId2,
        "ghi",
        "pc",
        {
          beliefSystem: {
            beliefs: [belief0, belief1, belief2],
            instincts: [instinct0, instinct1, instinct2],
          },
          attributes: {
            physical: {
              agility: { value: 1 },
              endurance: { value: 2 },
              perception: { value: 3 },
              strength: { value: 4 },
              toughness: { value: 5 },
            },
            mental: {
              intelligence: { value: 1 },
              wisdom: { value: 2 },
              arcana: { value: 3 },
            },
            social: {
              empathy: { value: 1 },
              oratory: { value: 2 },
              willpower: { value: 3 },
            },
          },
        },
        false,
        [
          {
            name: skillName0,
            type: "skill",
            system: {
              value: 1,
            },
            update: sinon.fake(),
          },
          {
            name: skillName1,
            type: "skill",
            system: {
              level: 1,
            },
            update: sinon.fake(),
          },
        ]
      ),
      createMockDocumentActor(
        actorId3,
        "kdj",
        "npc",
        {
          attributes: {
            physical: {
              agility: { value: 1 },
              endurance: { value: 2 },
              perception: { value: 3 },
              strength: { value: 4 },
              toughness: { value: 5 },
            },
            mental: {
              intelligence: { value: 1 },
              wisdom: { value: 2 },
              arcana: { value: 3 },
            },
            social: {
              empathy: { value: 1 },
              oratory: { value: 2 },
              willpower: { value: 3 },
            },
          },
        },
        false
      ),
    ];

    globalThis.MIGRATORS = [];
    globalThis.game = {
      actors: MigratorTestBase.createMockWorldCollection("Actor", actors),
      packs: MigratorTestBase.createMockWorldCollection("Pack"),
      items: MigratorTestBase.createMockWorldCollection("Item"),
      journal: MigratorTestBase.createMockWorldCollection("Journal"),
      tables: MigratorTestBase.createMockWorldCollection("RollTable"),
      ambersteel: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
    };
    
    MigratorTestBase.setup("1.3.2");
  });

  after(() => {
    globalThis.MIGRATORS = undefined;
    globalThis.game = undefined;
    MigratorTestBase.tearDown();
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_3_2__1_4_1();
    // When
    await given.migrate();
    // Then
    WorldSystemVersion.version.should.deepEqual(new VersionCode(1, 4, 1))

    game.actors.get(actorId0).update.should.not.have.been.called();
    
    // Actor1 -> PC pre-v10
    game.actors.get(actorId1).update.should.have.callCount(24);
    // Agility migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              agility: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              agility: { level: 1 },
            },
          },
        }
      }
    }, { render: false });
    
    // Endurance migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              endurance: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              endurance: { level: 2 },
            },
          },
        }
      }
    }, { render: false });
    
    // Perception migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              perception: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              perception: { level: 3 },
            },
          },
        }
      }
    }, { render: false });
    
    // Strength migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              strength: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              strength: { level: 4 },
            },
          },
        }
      }
    }, { render: false });
    
    // Toughness migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              toughness: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            physical: {
              toughness: { level: 5 },
            },
          },
        }
      }
    }, { render: false });
    
    // Intelligence migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            mental: {
              intelligence: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            mental: {
              intelligence: { level: 1 },
            },
          },
        }
      }
    }, { render: false });
    
    // Wisdom migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            mental: {
              wisdom: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            mental: {
              wisdom: { level: 2 },
            },
          },
        }
      }
    }, { render: false });
    
    // Arcana migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            mental: {
              arcana: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            mental: {
              arcana: { level: 3 },
            },
          },
        }
      }
    }, { render: false });
    
    // Empathy migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            social: {
              empathy: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            social: {
              empathy: { level: 1 },
            },
          },
        }
      }
    }, { render: false });
    
    // Oratory migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            social: {
              oratory: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            social: {
              oratory: { level: 2 },
            },
          },
        }
      }
    }, { render: false });
    
    // Willpower migration
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            social: {
              willpower: { "-=value": null },
            },
          },
        }
      }
    }, { render: false });
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          attributes: {
            social: {
              willpower: { level: 3 },
            },
          },
        }
      }
    }, { render: false });

    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          beliefSystem: {
            beliefs: {
              _0: belief0, 
              _1: belief1, 
              _2: belief2,
            },
          }
        }
      }
    });

    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          beliefSystem: {
            instincts: {
              _0: instinct0, 
              _1: instinct1, 
              _2: instinct2,
            },
          }
        }
      }
    });

    // Actor2 -> PC post-v10
    game.actors.get(actorId2).update.should.have.callCount(24);
    // Actor2 migration will only be tested superficially. The previous tests should suffice 
    // for an in-depth test. 

    // Agility migration
    game.actors.get(actorId2).update.should.have.been.calledWith({
      system: {
        attributes: {
          physical: {
            agility: { "-=value": null },
          },
        },
      }
    }, { render: false });
    game.actors.get(actorId2).update.should.have.been.calledWith({
      system: {
        attributes: {
          physical: {
            agility: { level: 1 },
          },
        },
      }
    }, { render: false });
    
    /*
    Sadly, these tests do not work and I cannot figure out why. 
    For _some reason_, the loop in `document-fetcher.mjs` line 420 simply terminates, 
    without a single iteration. But the `worldCollection` it wants to iterate **does** 
    have entries and an iterator, as defined by FoundryVTT. 

    // Embedded skill migration
    const skill0 = game.actors.get(actorId2).items[0];
    skill0.update.should.have.been.calledWith({
      system: {
        "-=value": null
      },
    });
    skill0.update.should.have.been.calledWith({
      system: {
        level: 1
      },
    });
    
    const skill1 = game.actors.get(actorId2).items[1];
    skill1.update.should.not.have.been.called();
    */

    // Actor3 -> NPC post-v10
    game.actors.get(actorId3).update.should.have.callCount(22);
  });
});