import AmbersteelWorldSettings from "../setting/ambersteel-world-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class LoadHealthStatesSettingUseCase extends AbstractUseCase {
  /**
   * @param {*} args 
   * 
   * @returns {Object}
   */
  invoke(args) {
    const ds = new AmbersteelWorldSettings();
    return ds.get(AmbersteelWorldSettings.KEY_CUSTOM_HEALTH_STATES);
  }
}