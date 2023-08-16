import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import Migrator_1_5_0__1_5_1 from '../../../../business/migration/migrators/migrator_1-5-0_1-5-1.mjs';
import { WorldSystemVersion } from '../../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';

describe("Migrator_1_5_0__1_5_1", () => {
  before(() => {
    MigratorTestBase.setup("1.5.0");
  });

  after(() => {
    globalThis.MIGRATORS = undefined;
    globalThis.game = undefined;
    MigratorTestBase.tearDown();
  });

  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_5_0__1_5_1();
    // When
    await given.migrate();
    // Then
    WorldSystemVersion.get().should.deepEqual(new VersionCode(1, 5, 1))
  });
});