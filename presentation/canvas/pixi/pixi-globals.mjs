import VersionCode from "../../../business/migration/version-code.mjs"

export const PIXI_GLOBALS = {
  /**
   * @type {VersionCode}
   * @constant
   * @readonly
   */
  PIXI_VERSION: VersionCode.fromString(PIXI.VERSION),
  
  /**
   * @type {VersionCode}
   * @constant
   * @readonly
   */
  FOUNDRY_10_PIXI_VERSION: new VersionCode(6, 5, 2),
  
  /**
   * @type {VersionCode}
   * @constant
   * @readonly
   */
  FOUNDRY_11_PIXI_VERSION: new VersionCode(7, 4, 2),
}

