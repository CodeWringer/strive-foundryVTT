import { util } from "./util/_module.mjs";
import { application } from "./application/_module.mjs";
import { canvas } from "./canvas/_module.mjs";
import { font } from "./font/_module.mjs";
import RulesetExplainer from "./ruleset/ruleset-explainer.mjs";
import { sidebar } from "./application/sidebar/_module.mjs";
import { TEMPLATES } from "./application/templates.mjs";
import ChoiceOption from "./model/choice-option.mjs";
import { GameSystemUserSettings } from "../business/setting/game-system-user-settings.mjs";
import GameSystemSetting from "../business/setting/game-system-setting.mjs";
import { SETTING_SCOPES } from "../business/setting/setting-scopes.mjs";

/**
 * Wraps the `presentation` module. 
 * 
 * IMPORTANT the `init` function MUST be called during the system's setup!
 */
export const presentation = {
  TEMPLATES: TEMPLATES,
  util: util,
  font: font,
  application: application,
  canvas: canvas,
  sidebar: sidebar,
  RulesetExplainer: RulesetExplainer,
  model: {
    ChoiceOption: ChoiceOption,
  },
  /**
   * Initialization, which MUST be called during system setup!
   * 
   * Ensures sheets are registered and preloads Handlebars templates.
   * 
   */
  init: async () => {
    application.init();
    canvas.init();
    sidebar.init();
    font.init();
  },
  /**
   * Initialization to be called during the system's "setup" hook. 
   */
  setup: () => {
    util.setup();
  },
  /**
   * Initialization to be called during the system's "ready" hook. 
   */
  ready: () => {
    util.ready();
    
    // Enable STRIVE's custom font, based on user setting. 
    const isUsingStriveFont = new GameSystemSetting({
      key: GameSystemUserSettings.KEY_USE_STRIVE_FONT,
      scope: SETTING_SCOPES.USER,
    }).value;
    if (isUsingStriveFont) {
      $("body").addClass("strive-regular-font");
    }
  },
};
