import AmbersteelUserSettings from "../settings/ambersteel-user-settings.mjs";
import AbstractUseCase from "./abstract-use-case.mjs";

export default class GetShowFancyFontUseCase extends AbstractUseCase {
  invoke() {
    return new AmbersteelUserSettings().get(AmbersteelUserSettings.KEY_SHOW_FANCY_FONT);
  }
}
