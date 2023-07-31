import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import Migrator_1_5_2__1_5_3 from '../../../../business/migration/migrators/migrator_1-5-2_1-5-3.mjs';
import { BaseLoggingStrategy } from '../../../../business/logging/base-logging-strategy.mjs';
import { SKILL_PROPERTIES } from '../../../../business/document/item/item-properties.mjs';
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

/**
 * Creates a new mock document of type "Actor" and returns it. 
 * 
 * @param {String} id
 * @param {String} name
 * @param {String} type Internal type name, e. g. `"skill"`.
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
function createMockDocumentItem(id, name, type, systemData = {}, isPreV10 = false) {
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
  /**
   * Plain actor
   */
  const actorId0 = "actorId0";
  /**
   * PC; with "beliefSystem" field; pre-v10
   */
  const actorId1 = "actorId1";
  /**
   * PC; with "beliefSystem" field; post-v10
   */
  const actorId2 = "actorId2";
  /**
   * PC; with "driverSystem" field; pre-v10
   */
  const actorId3 = "actorId3";
  /**
   * PC; with "driverSystem" field; post-v10
   */
  const actorId4 = "actorId4";

  const givenAmbition = "ambition";

  const givenReaction0 = "reaction_0";
  const givenReaction1 = "reaction_1";
  const givenReaction2 = "reaction_2";

  const givenAspiration0 = "aspiration_0";
  const givenAspiration1 = "aspiration_1";
  const givenAspiration2 = "aspiration_2";

  /**
   * Non-magic school skill. 
   */
  const givenSkillId0 = "givenSkillId0";

  /**
   * Magic school skill; pre-v10; empty properties
   */
  const givenSkillId1 = "givenSkillId1";
  /**
   * Magic school skill; post-v10; empty properties
   */
  const givenSkillId2 = "givenSkillId2";

  /**
   * Magic school skill; pre-v10; non-empty properties
   */
  const givenSkillId3 = "givenSkillId3";
  /**
   * Magic school skill; post-v10; non-empty properties
   */
  const givenSkillId4 = "givenSkillId4";

  /**
   * Magic school skill; pre-v10; magic_school already in properties
   */
  const givenSkillId5 = "givenSkillId5";
  /**
   * Magic school skill; post-v10; magic_school already in properties
   */
  const givenSkillId6 = "givenSkillId6";

  const givenOtherProperty = "some_other_property";

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

    const items = [
      createMockDocumentItem(
        givenSkillId0,
        givenSkillId0,
        "scar",
        undefined,
        undefined
      ),
      createMockDocumentItem(
        givenSkillId1,
        givenSkillId1,
        "skill",
        {
          isMagicSchool: true,
          properties: [],
        },
        true
      ),
      createMockDocumentItem(
        givenSkillId2,
        givenSkillId2,
        "skill",
        {
          isMagicSchool: true,
          properties: [],
        },
        false
        ),
        createMockDocumentItem(
          givenSkillId3,
          givenSkillId3,
          "skill",
          {
            isMagicSchool: true,
            properties: [givenOtherProperty],
          },
          true
        ),
        createMockDocumentItem(
          givenSkillId4,
          givenSkillId4,
          "skill",
          {
            isMagicSchool: true,
            properties: [givenOtherProperty],
          },
          false
        ),
        createMockDocumentItem(
          givenSkillId5,
          givenSkillId5,
          "skill",
          {
            isMagicSchool: true,
            properties: [givenOtherProperty, SKILL_PROPERTIES.MAGIC_SCHOOL.id],
          },
          true
        ),
        createMockDocumentItem(
          givenSkillId6,
          givenSkillId6,
          "skill",
          {
            isMagicSchool: true,
            properties: [givenOtherProperty, SKILL_PROPERTIES.MAGIC_SCHOOL.id],
          },
          false
        ),
      ];

    globalThis.MIGRATORS = [];
    globalThis.game = {
      actors: MigratorTestBase.createMockWorldCollection("Actor", actors),
      packs: MigratorTestBase.createMockWorldCollection("Pack"),
      items: MigratorTestBase.createMockWorldCollection("Item", items),
      journal: MigratorTestBase.createMockWorldCollection("Journal"),
      tables: MigratorTestBase.createMockWorldCollection("RollTable"),
      ambersteel: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
    };
    
    MigratorTestBase.setup("1.5.2");
  });

  after(() => {
    globalThis.MIGRATORS = undefined;
    globalThis.game = undefined;
    MigratorTestBase.tearDown();
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_5_2__1_5_3();

    // When
    await given._doWork();
    // Then

    // Ensure actor modifications are correct. 
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
    
    // Ensure skill modifications are correct. 
    game.items.get(givenSkillId0).update.should.not.have.been.called();
    
    game.items.get(givenSkillId1).update.should.have.been.calledTwice();
    game.items.get(givenSkillId1).update.getCall(0).should.have.been.calledWith({
      data: {
        data: {
          properties: [SKILL_PROPERTIES.MAGIC_SCHOOL.id],
        }
      }
    });
    game.items.get(givenSkillId1).update.getCall(1).should.have.been.calledWith({
      data: {
        data: {
          "-=isMagicSchool": null,
        }
      }
    });

    game.items.get(givenSkillId2).update.should.have.been.calledTwice();
    game.items.get(givenSkillId2).update.getCall(0).should.have.been.calledWith({
      system: {
        properties: [SKILL_PROPERTIES.MAGIC_SCHOOL.id],
      }
    });
    game.items.get(givenSkillId2).update.getCall(1).should.have.been.calledWith({
      system: {
        "-=isMagicSchool": null,
      }
    });
    
    game.items.get(givenSkillId3).update.should.have.been.calledTwice();
    game.items.get(givenSkillId3).update.getCall(0).should.have.been.calledWith({
      data: {
        data: {
          properties: [givenOtherProperty, SKILL_PROPERTIES.MAGIC_SCHOOL.id],
        }
      }
    });
    game.items.get(givenSkillId3).update.getCall(1).should.have.been.calledWith({
      data: {
        data: {
          "-=isMagicSchool": null,
        }
      }
    });
    
    game.items.get(givenSkillId4).update.should.have.been.calledTwice();
    game.items.get(givenSkillId4).update.getCall(0).should.have.been.calledWith({
      system: {
        properties: [givenOtherProperty, SKILL_PROPERTIES.MAGIC_SCHOOL.id],
      }
    });
    game.items.get(givenSkillId4).update.getCall(1).should.have.been.calledWith({
      system: {
        "-=isMagicSchool": null,
      }
    });

    game.items.get(givenSkillId5).update.should.have.been.calledOnce();
    game.items.get(givenSkillId5).update.should.have.been.calledWith({
      data: {
        data: {
          "-=isMagicSchool": null,
        }
      }
    });
    

    game.items.get(givenSkillId6).update.should.have.been.calledOnce();
    game.items.get(givenSkillId6).update.should.have.been.calledWith({
      system: {
        "-=isMagicSchool": null,
      }
    });
    
  });
});