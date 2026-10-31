
import { ConstantsUtil } from "../../common/util/constants-utility.mjs";
import GameSystemSettingDeclaration from "./game-system-setting-declaration.mjs";
import GameSystemSetting from "./game-system-setting.mjs";
import GameSystemSettings from "./game-system-settings.mjs";
import { GameSystemUserSettings } from "./game-system-user-settings.mjs";
import { GameSystemWorldSettings } from "./game-system-world-settings.mjs";
import { LIST_ITEM_EXPANSION_MODES } from "./list-item-expansion-modes.mjs";
import { SETTING_SCOPES } from "./setting-scopes.mjs";

/**
 * Wraps the `business` module, which contains all the 
 * 
 * Note the `ready` function MUST be called immediately after system setup!
 */
export const setting = {
  SETTING_SCOPES: SETTING_SCOPES,
  LIST_ITEM_EXPANSION_MODES: LIST_ITEM_EXPANSION_MODES,
  GameSystemSettingDeclaration: GameSystemSettingDeclaration,
  GameSystemSettings: GameSystemSettings,
  GameSystemSetting: GameSystemSetting,
  GameSystemUserSettings: GameSystemUserSettings,
  GameSystemWorldSettings: GameSystemWorldSettings,
  /**
   * Initialization to be called during the system's setup. 
   */
  init: () => {
    ConstantsUtil.enrichConstant(LIST_ITEM_EXPANSION_MODES);
    GameSystemUserSettings.init();
    GameSystemWorldSettings.init();
  },
  /**
   * Initialization to be called during the system's "ready" hook. 
   */
  ready: () => {
    GameSystemSettings.ready();
  },
};
