import GameSystemWorldSettings from "../setting/game-system-world-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class LoadHealthStatesSettingUseCase extends AbstractUseCase {
  /**
   * @returns {Object}
   */
  invoke() {
    const ds = new GameSystemWorldSettings();
    return ds.get(GameSystemWorldSettings.KEY_CUSTOM_HEALTH_CONDITIONS);
  }
}