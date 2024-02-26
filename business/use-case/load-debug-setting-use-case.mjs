import GameSystemUserSettings from "../setting/game-system-user-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class LoadDebugSettingUseCase extends AbstractUseCase {
  invoke(args) {
    const ds = new GameSystemUserSettings();
    return ds.get(GameSystemUserSettings.KEY_TOGGLE_DEBUG);
  }
}