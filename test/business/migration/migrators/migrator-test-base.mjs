import sinon from 'sinon';

export function setup(versionString) {
  // Setup
  globalThis.game = {
    system: {
      version: versionString,
    },
    settings: {
      register: sinon.fake(),
      get: () => globalThis.game.system.version,
      set: (n, key, value) => { globalThis.game.system.version = value; },
    },
  };
}
