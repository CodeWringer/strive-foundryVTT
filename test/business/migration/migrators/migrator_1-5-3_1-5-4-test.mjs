import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { WorldSystemVersion } from '../../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';
import Migrator_1_5_3__1_5_4 from '../../../../business/migration/migrators/migrator_1-5-3_1-5-4.mjs';

describe("Migrator_1_5_3__1_5_4", () => {
  before(() => {
    MigratorTestBase.setup("1.5.3");
  });

  after(() => {
    globalThis.MIGRATORS = undefined;
    globalThis.game = undefined;
    MigratorTestBase.tearDown();
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_5_3__1_5_4();
    // When
    await given.migrate();
    // Then
    WorldSystemVersion.version.should.deepEqual(new VersionCode(1, 5, 4))
  });
});