import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import MigratorInitiator from '../../../business/migration/migrator-initiator.mjs';
import { WorldSystemVersion } from '../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrators/migrator-test-base.mjs';
import { BaseLoggingStrategy } from '../../../business/logging/base-logging-strategy.mjs';
import Migrator_1_5_3__1_5_4 from '../../../business/migration/migrators/migrator_1-5-3_1-5-4.mjs';
import Migrator_1_5_4__1_5_5 from '../../../business/migration/migrators/migrator_1-5-4_1-5-5.mjs';

/**
 * Mocks the active and world system versions. 
 * 
 * @param {String} worldVersion The faked world system version.
 * * E.g. `"1.5.3"`
 * @param {String} systemVersion The faked active system version. 
 * * E.g. `"1.5.5"`
 */
function _mockVersions(worldVersion, systemVersion) {
  globalThis.game.system._worldVersion = worldVersion;
  globalThis.game.system.version = systemVersion;
}

describe("MigratorInitiator", () => {
  before((done) => {
    globalThis.game = {
      settings: {
        get: (namespace, key) => {
          if (namespace === WorldSystemVersion._settingNamespace && key === WorldSystemVersion._settingKey) {
            return globalThis.game.system._worldVersion;
          }
        },
        set: (namespace, key, value) => {
          if (namespace === WorldSystemVersion._settingNamespace && key === WorldSystemVersion._settingKey) {
            globalThis.game.system._worldVersion = value;
          }
        },
        register: sinon.fake(),
      },
      system: {
        _worldVersion: "0.0.0",
      },
      actors: MigratorTestBase.createMockWorldCollection("Actor"),
      packs: MigratorTestBase.createMockWorldCollection("Pack"),
      items: MigratorTestBase.createMockWorldCollection("Item"),
      journal: MigratorTestBase.createMockWorldCollection("Journal"),
      tables: MigratorTestBase.createMockWorldCollection("RollTable"),
      strive: {
        logger: sinon.createStubInstance(BaseLoggingStrategy),
      },
    };

    sinon.spy(globalThis.game.settings, ["set"]);

    done();
  });

  after((done) => {
    globalThis.game = null;
    globalThis.game = undefined;

    done();
  });

  it("is applicable with world system version 1.5.3 and active version 1.5.5", () => {
    // Given
    const given = new MigratorInitiator();
    
    // Setup
    _mockVersions("1.5.3", "1.5.5");

    given._getMigrators = () => {
      return [
        new Migrator_1_5_3__1_5_4(),
        new Migrator_1_5_4__1_5_5(),
      ];
    };

    // When
    const r = given.isApplicable();

     // Then
     r.should.be.eql(true);
  });

  it("is NOT applicable with world system version 1.5.5 and active version 1.5.5", () => {
    // Given
    const given = new MigratorInitiator();
    
    // Setup
    _mockVersions("1.5.5", "1.5.5");
    
    given._getMigrators = () => {
      return [
        new Migrator_1_5_3__1_5_4(),
        new Migrator_1_5_4__1_5_5(),
      ];
    };

    // When
    const r = given.isApplicable();

     // Then
     r.should.be.eql(false);
  });

  it("migrates from 1.5.3 up to 1.5.5 in one go", async () => {
    // Given
    const given = new MigratorInitiator();
    
    // Setup
    _mockVersions("1.5.3", "1.5.5");

    given._getMigrators = () => {
      return [
        new Migrator_1_5_3__1_5_4(),
        new Migrator_1_5_4__1_5_5(),
      ];
    };

    // When
    const finalMigrationVersion = given.finalMigrationVersion;
    await given.migrateAsPossible();

    // Then
    finalMigrationVersion.should.be.deepEqual(new VersionCode(1, 5, 5));

    globalThis.game.settings.set.should.have.been.calledTwice();
    globalThis.game.settings.set.should.have.been.calledWith(
      WorldSystemVersion._settingNamespace,
      WorldSystemVersion._settingKey,
      "1.5.4"
    );
    globalThis.game.settings.set.should.have.been.calledWith(
      WorldSystemVersion._settingNamespace,
      WorldSystemVersion._settingKey,
      "1.5.5"
    );
  });
});