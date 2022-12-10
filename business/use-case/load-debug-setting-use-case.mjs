import AmbersteelUserSettings from "../setting/ambersteel-user-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class LoadDebugSettingUseCase extends AbstractUseCase {
  invoke(args) {
    const ds = new AmbersteelUserSettings();
    return ds.get(AmbersteelUserSettings.KEY_TOGGLE_DEBUG);
  }
}