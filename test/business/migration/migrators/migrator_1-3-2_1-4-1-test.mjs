import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { WorldSystemVersion } from '../../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';
import Migrator_1_3_2__1_4_1 from '../../../../business/migration/migrators/migrator_1-3-2_1-4-1.mjs';
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
    items: [],
  };
}

describe("Migrator_1_3_2__1_4_1", () => {
  const actorId0 = "actorId0";
  const actorId1 = "actorId1";
  const actorId2 = "actorId2";

  const belief0 = "belief0";
  const belief1 = "belief1";
  const belief2 = "belief2";

  const instinct0 = "instinct0";
  const instinct1 = "instinct1";
  const instinct2 = "instinct2";

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_3_2__1_4_1();
    MigratorTestBase.setup("1.3.2");
    // Setup
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
    // When
    await given.migrate();
    // Then
    WorldSystemVersion.version.should.deepEqual(new VersionCode(1, 4, 1))

    game.actors.get(actorId0).update.should.not.have.been.called();
    
    game.actors.get(actorId1).update.should.have.been.calledTwice();
    game.actors.get(actorId1).update.should.have.been.calledWith({
      data: {
        data: {
          beliefSystem: {
            beliefs: {
              _0: belief0, 
              _1: belief1, 
              _2: belief2,
            },
            instincts: {
              _0: instinct0, 
              _1: instinct1, 
              _2: instinct2,
            },
            attributes: {
              physical: {
                agility: { level: 1 },
                endurance: { level: 2 },
                perception: { level: 3 },
                strength: { level: 4 },
                toughness: { level: 5 },
              },
              mental: {
                intelligence: { level: 1 },
                wisdom: { level: 2 },
                arcana: { level: 3 },
              },
              social: {
                empathy: { level: 1 },
                oratory: { level: 2 },
                willpower: { level: 3 },
              },
            },
          }
        }
      }
    });
  });
});