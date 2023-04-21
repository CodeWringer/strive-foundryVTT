import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
import { WorldSystemVersion } from '../../../../business/migration/world-system-version.mjs';
import VersionCode from '../../../../business/migration/version-code.mjs';
import * as MigratorTestBase from './migrator-test-base.mjs';
import Migrator_1_3_2__1_4_1 from '../../../../business/migration/migrators/migrator_1-3-2_1-4-1.mjs';

describe("Migrator_1_3_2__1_4_1", () => {
  it("migrates correctly", async () => {
    // Given
    const given = new Migrator_1_3_2__1_4_1();
    MigratorTestBase.setup("1.3.2");
    // When
    await given.migrate();
    // Then
    WorldSystemVersion.version.should.deepEqual(new VersionCode(1, 4, 1))
  });
});