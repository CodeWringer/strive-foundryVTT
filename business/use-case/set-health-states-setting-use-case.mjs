import AmbersteelWorldSettings from "../setting/ambersteel-world-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class SetHealthStatesSettingUseCase extends AbstractUseCase {
  /**
   * @param {Object} args The settings to set. 
   * 
   * @returns {Object}
   */
  invoke(args) {
    const ds = new AmbersteelWorldSettings();
    return ds.set(AmbersteelWorldSettings.KEY_CUSTOM_HEALTH_STATES, args);
  }
}