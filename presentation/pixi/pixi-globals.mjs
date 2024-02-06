import VersionCode from "../../business/migration/version-code.mjs";

/**
 * @type {VersionCode}
 * @constant
 * @readonly
 */
export const PIXI_VERSION = VersionCode.fromString(PIXI.VERSION);

/**
 * @type {VersionCode}
 * @constant
 * @readonly
 */
export const FOUNDRY_10_PIXI_VERSION = new VersionCode(6, 5, 2);
