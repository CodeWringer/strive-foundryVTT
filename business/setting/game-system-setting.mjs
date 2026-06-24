import { common } from "../../common/_module.mjs";
import GameSystemSettings from "./game-system-settings.mjs";
import { SETTING_SCOPES } from "./setting-scopes.mjs";

/**
 * Represents a known system-specific setting. 
 * 
 * @property {String} key An internal name by which to identify the setting. 
 * @property {SETTING_SCOPES} scope Scope of the setting. 
 * @property {Any} value The current value. 
 * Use the `set()` method to persist the value! 
 */
export default class GameSystemSetting {
  /**
   * @param {Object} args 
   * @param {String} args.key An internal name by which to identify the setting. 
   * @param {SETTING_SCOPES} args.scope Scope of the setting. 
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["key", "scope"]);

    this.key = args.key;
    this.scope = args.scope;
    this.value = GameSystemSettings.get(this._getKey());
  }

  /**
   * Persists the setting's current value. 
   */
  set() {
    GameSystemSettings.set(this._getKey(), this.value);
  }

  /**
   * Returns the key to identify the setting with, under consideration of whether 
   * it is a user or world setting. 
   * 
   * @returns {String}
   * @private
   */
  _getKey() {
    if (this.scope === SETTING_SCOPES.USER) {
      return `${game.userId}-${this.key}`;
    } else {
      return this.key;
    }
  }
}
