import GameSystemUserSettings from "../setting/game-system-user-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class GetShowFancyFontUseCase extends AbstractUseCase {
  invoke() {
    return new GameSystemUserSettings().get(GameSystemUserSettings.KEY_SHOW_FANCY_FONT);
  }
}
