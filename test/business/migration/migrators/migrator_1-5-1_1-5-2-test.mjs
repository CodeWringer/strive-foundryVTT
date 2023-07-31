import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import Migrator_1_5_1__1_5_2 from '../../../../business/migration/migrators/migrator_1-5-1_1-5-2.mjs';
import { BaseLoggingStrategy } from '../../../../business/logging/base-logging-strategy.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';

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

describe("Migrator_1_5_1__1_5_2", () => {
  const actorId0 = "actorId0";
  const actorId1 = "actorId1";
  const actorId2 = "actorId2";

  const instinct0 = "instinct_0";
  const instinct1 = "instinct_1";
  const instinct2 = "instinct_2";

  const reaction0 = "instinct_0";
  const reaction1 = "instinct_1";
  const reaction2 = "instinct_2";

  before(function() {
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
            instincts: {
              _0: instinct0,
              _1: instinct1,
              _2: instinct2,
            }
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
            reactions: {
              _0: reaction0,
              _1: reaction1,
              _2: reaction2,
            }
          }
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

    MigratorTestBase.setup("1.5.1");
  });

  after(() => {
    globalThis.MIGRATORS = undefined;
    globalThis.game = undefined;
    MigratorTestBase.tearDown();
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_5_1__1_5_2();

    // When
    await given._doWork();
    // Then
    game.actors.get(actorId0).update.should.not.have.been.called();
    
    game.actors.get(actorId1).update.should.have.been.calledTwice();
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          beliefSystem: {
            reactions: {
              _0: instinct0,
              _1: instinct1,
              _2: instinct2,
            }
          }
        }
      }
    });

    game.actors.get(actorId2).update.should.not.have.been.called();
  });
});