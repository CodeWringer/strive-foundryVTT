import AbstractMigrator from "../abstract-migrator.mjs"
import VersionCode from "../version-code.mjs"

export default class Migrator_1_16_2__2_0_0 extends AbstractMigrator {
  /** @override */
  get fromVersion() { return new VersionCode(1, 16, 2) };

  /** @override */
  get toVersion() { return new VersionCode(2, 0, 0) };

  /** @override */
  async _doWork(args = {}) {
    // TODO
    args.onComplete();
  }
}
