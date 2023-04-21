import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { WorldSystemVersion } from '../../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';
import Migrator_1_4_1__1_5_0 from '../../../../business/migration/migrators/migrator_1-4-1_1-5-0.mjs';

describe("Migrator_1_4_1__1_5_0", () => {
  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_4_1__1_5_0();
    MigratorTestBase.setup("1.4.1");
    // When
    await given.migrate();
    // Then
    WorldSystemVersion.version.should.deepEqual(new VersionCode(1, 5, 0))
  });
});