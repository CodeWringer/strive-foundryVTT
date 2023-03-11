import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import Migrator_1_5_2__1_5_3 from '../../../../business/migration/migrators/migrator_1-5-2_1-5-3.mjs';
import { BaseLoggingStrategy } from '../../../../business/logging/base-logging-strategy.mjs';

/**
 * Creates a new map, modifies it to look like a FoundryVTT world collection 
 * (e. g. `game.actors`) and returns it. 
 * 
 * @param {String} documentName The document type of the collection. 
 * * E. g. `"Actor"`. 
 * @param {Array<Object>} items 
 * * Every element is expected to be an object with the following field(s): 
 * * * `id: {String}`
 * 
 * @returns {Map}
 */
function createMockWorldCollection(documentName, items) {
  const map = new Map();
  map.documentName = documentName;
  for (const item of (items ?? [])) {
    map.set(item.id, item);
  }

  return map;
}

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

describe("Migrator_1_5_2__1_5_3", () => {
  const actorId0 = "actorId0";
  const actorId1 = "actorId1";
  const actorId2 = "actorId2";
  const actorId3 = "actorId3";
  const actorId4 = "actorId4";

  const givenAmbition = "ambition";

  const givenReaction0 = "reaction_0";
  const givenReaction1 = "reaction_1";
  const givenReaction2 = "reaction_2";

  const givenAspiration0 = "aspiration_0";
  const givenAspiration1 = "aspiration_1";
  const givenAspiration2 = "aspiration_2";

  beforeEach(function() {
    const actors = [
      // A plain actor. 
      createMockDocumentActor(
        actorId0,
        "abc",
        "plain",
      ),
      // An actor with the old "beliefSystem" field. Pre-v10
      createMockDocumentActor(
        actorId1,
        "def",
        "pc",
        {
          beliefSystem: {
            ambition: givenAmbition,
            reactions: {
              _0: givenReaction0,
              _1: givenReaction1,
              _2: givenReaction2,
            },
            beliefs: {
              _0: givenAspiration0,
              _1: givenAspiration1,
              _2: givenAspiration2,
            },
          }
        },
        true
      ),
      // An actor with the old "beliefSystem" field. Post-v10
      createMockDocumentActor(
        actorId2,
        "def",
        "pc",
        {
          beliefSystem: {
            ambition: givenAmbition,
            reactions: {
              _0: givenReaction0,
              _1: givenReaction1,
              _2: givenReaction2,
            },
            beliefs: {
              _0: givenAspiration0,
              _1: givenAspiration1,
              _2: givenAspiration2,
            },
          }
        },
        false
      ),
      // An actor with the new "driverSystem" field. Pre-v10
      createMockDocumentActor(
        actorId3,
        "def",
        "pc",
        {
          driverSystem: {
            ambition: givenAmbition,
            reactions: {
              _0: givenReaction0,
              _1: givenReaction1,
              _2: givenReaction2,
            },
            aspirations: {
              _0: givenAspiration0,
              _1: givenAspiration1,
              _2: givenAspiration2,
            },
          }
        },
        true
      ),
      // An actor with the new "driverSystem" field. Post-v10
      createMockDocumentActor(
        actorId4,
        "def",
        "pc",
        {
          driverSystem: {
            ambition: givenAmbition,
            reactions: {
              _0: givenReaction0,
              _1: givenReaction1,
              _2: givenReaction2,
            },
            aspirations: {
              _0: givenAspiration0,
              _1: givenAspiration1,
              _2: givenAspiration2,
            },
          }
        },
        false
      ),
    ];

    globalThis.MIGRATORS = [];
    globalThis.game = {
      actors: createMockWorldCollection("Actor", actors),
      packs: createMockWorldCollection("Pack"),
      items: createMockWorldCollection("Item"),
      journal: createMockWorldCollection("Journal"),
      tables: createMockWorldCollection("RollTable"),
      ambersteel: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
    };
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_5_2__1_5_3();

    // When
    await given._doWork();
    // Then
    game.actors.get(actorId0).update.should.not.have.been.called();
    
    game.actors.get(actorId1).update.should.have.been.calledTwice();
    game.actors.get(actorId1).update.getCall(0).should.have.been.calledWith({
      data: {
        data: {
          driverSystem: {
            ambition: givenAmbition,
            aspirations: {
              _0: givenAspiration0,
              _1: givenAspiration1,
              _2: givenAspiration2,
            },
            reactions: {
              _0: givenReaction0,
              _1: givenReaction1,
              _2: givenReaction2,
            },
          }
        }
      }
    });
    game.actors.get(actorId1).update.getCall(1).should.have.been.calledWith({
      data: {
        data: {
          "-=beliefSystem": null,
        }
      }
    });
    
    game.actors.get(actorId2).update.should.have.been.calledTwice();
    game.actors.get(actorId2).update.getCall(0).should.have.been.calledWith({
      system: {
        driverSystem: {
          ambition: givenAmbition,
          aspirations: {
            _0: givenAspiration0,
            _1: givenAspiration1,
            _2: givenAspiration2,
          },
          reactions: {
            _0: givenReaction0,
            _1: givenReaction1,
            _2: givenReaction2,
          },
        }
      }
    });
    game.actors.get(actorId2).update.getCall(1).should.have.been.calledWith({
      system: {
        "-=beliefSystem": null, 
      }
    });

    game.actors.get(actorId3).update.should.not.have.been.called();
    game.actors.get(actorId4).update.should.not.have.been.called();
  });
});