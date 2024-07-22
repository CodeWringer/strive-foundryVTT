import GameSystemWorldSettings from "../setting/game-system-world-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class SetHealthStatesSettingUseCase extends AbstractUseCase {
  /**
   * @param {Object} args The settings to set. 
   * 
   * @returns {Object}
   */
  invoke(args) {
    const ds = new GameSystemWorldSettings();
    return ds.set(GameSystemWorldSettings.KEY_CUSTOM_HEALTH_STATES, args);
  }
}