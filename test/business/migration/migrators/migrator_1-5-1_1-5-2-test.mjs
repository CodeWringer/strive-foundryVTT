import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import Migrator_1_5_1__1_5_2 from '../../../../business/migration/migrators/migrator_1-5-1_1-5-2.mjs';

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

  beforeEach(function() {
    const actors = new Map();
    actors.set(actorId0, {
      id: "1",
      type: "plain",
      system: {}
    });
    actors.set(actorId1, {
      id: "1",
      type: "pc",
      data: {
        data: {
          instincts: {
            _0: instinct0,
            _1: instinct1,
            _2: instinct2,
          }
        }
      }
    });
    actors.set(actorId2, {
      id: "1",
      type: "pc",
      system: {
        reactions: {
          _0: reaction0,
          _1: reaction1,
          _2: reaction2,
        }
      }
    });

    globalThis.MIGRATORS = [];
    globalThis.window = {};
    globalThis.game = {
      actors: actors,
      packs: new Map(),
    };
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_5_1__1_5_2();

    // When
    await given._doWork();
    // Then
    game.actors[1].system.reactions._0.should.be.eql(instinct0);
    game.actors[1].system.reactions._1.should.be.eql(instinct1);
    game.actors[1].system.reactions._2.should.be.eql(instinct2);

    game.actors[2].system.reactions._0.should.be.eql(reaction0);
    game.actors[2].system.reactions._1.should.be.eql(reaction1);
    game.actors[2].system.reactions._2.should.be.eql(reaction2);
  });
});