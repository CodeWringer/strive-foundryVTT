// Root Globals
import { common } from "./common/_module.mjs";
import { business } from "./business/_module.mjs";
import { WorldSystemVersion } from "./business/migration/world-system-version.mjs";
import { presentation } from "./presentation/_module.mjs";
// Utility
import VersionCode from "./business/migration/version-code.mjs";
// Migration
import MigratorInitiator from "./business/migration/migrator-initiator.mjs";
import { GameSystemUserSettings } from "./business/setting/game-system-user-settings.mjs";
import CustomProseMirrorMenu from "./presentation/application/component/input-rich-text/custom-prose-mirror-menu.mjs";

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Ensure the system's namespace exists. 
  // Adds system specific logic to the global namespace. 
  game.strive = {
    // Module namespaces. 
    common: common,
    business: business,
    presentation: presentation,

    /**
     * Used to log system specific notifications. 
     * @type {ConsoleLogger}
     */
    logger: new common.logging.ConsoleLogger(common.logging.LOG_LEVELS.ERROR),

    /**
     * @type {Boolean}
     * @private
     */
    _debug: false,
    /**
     * @type {Boolean}
     */
    get debug() { return this._debug },
    /**
     * @param {Boolean} value
     */
    set debug(value) {
      this._debug = value;
      if (value === true) {
        this.logger = new common.logging.ConsoleLogger(common.logging.LOG_LEVELS.VERBOSE);
      } else {
        this.logger = new common.logging.ConsoleLogger(common.logging.LOG_LEVELS.ERROR);
      }
    },

    /**
     * If `true`, rule reminders and explanations will be shown.
     * @type {Boolean}
     */
    enableReminders: true,

    /**
     * If `true`, unusable Expertises (i. e., Expertises with a higher Level requirement 
     * than their parent Skill's Level) will be displayed normally. Otherwise, they will 
     * be somewhat hidden, so as not to get in the way. 
     * @type {Boolean}
     */
    enableUnusableExpertiseExpansion: false,

    /**
     * The global collection of view models. 
     * 
     * Any newly instantiated view models will be added to this list. Then, during their activateListeners-call, 
     * they'll pull (remove) themselves from this list and add themselves to their corresponding owner. 
     * An owner could be an {ActorSheet} or {ItemSheet}. 
     * @type {ViewModelCollection}
     */
    viewModels: new presentation.application.viewModel.ViewModelCollection(),
    /**
     * The global view states map. 
     * 
     * @type {Map<String, Object>}
     */
    viewStates: new Map(),

    /**
     * Registered extenders. A class may have any number of extenders applied to it, 
     * which is why the Map's value is an array of extenders. 
     * 
     * To register an extender, use `game.strive.util.extender.addExtender(clazz, extender)`
     * 
     * @type {Map<any, Array<Object>>}
     */
    extenders: new Map(),
  };

  // Module setup. 
  business.init();
  presentation.init();
});

Hooks.once('setup', function () {
  business.setup();
  presentation.setup();
});

Hooks.once("ready", function () {
  business.ready();
  presentation.ready();

  // Fetch and apply settings.
  game.strive.debug = new business.setting.GameSystemSetting({
    key: business.setting.GameSystemUserSettings.KEY_TOGGLE_DEBUG,
    scope: business.setting.SETTING_SCOPES.USER,
  }).value;

  game.strive.enableReminders = new business.setting.GameSystemSetting({
    key: business.setting.GameSystemUserSettings.KEY_TOGGLE_REMINDERS,
    scope: business.setting.SETTING_SCOPES.USER,
  }).value;

  game.strive.enableUnusableExpertiseExpansion = new business.setting.GameSystemSetting({
    key: business.setting.GameSystemUserSettings.KEY_TOGGLE_UNUSABLE_EXPERTISE_VISIBILITY,
    scope: business.setting.SETTING_SCOPES.USER,
  }).value;

  // Migration check. 
  const migrator = new MigratorInitiator();

  if (migrator.isApplicable() === true) {
    if (game.user.isGM === true) {
      // TODO
      // new MigratorDialog().render(true);
    } else {
      // Display warning to non-GM. 
      // TODO
      // new PlainDialog({
      //   localizedTitle: game.i18n.localize("system.migration.titleMigrationRequired"),
      //   localizedContent: game.i18n.localize("system.migration.migrationRequiredUserWarning"),
      // }).render(true);
    }
  } else {
    game.strive.logger.logVerbose("Version up to date - skipping migrations");
    // Ensure the current system version is saved. 
    WorldSystemVersion.set(migrator.finalMigrationVersion);
  }

  // Register dev dialogs, if necessary.
  if (game.strive.debug) {
    window.runMigration = async function (fromVersion) {
      // Fake world system version. Without this, migrators might not run. 
      const fakeVersion = VersionCode.fromString(fromVersion);
      await WorldSystemVersion.set(fakeVersion);

      // TODO
      // new MigratorDialog().render(true);
    };
  }
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessageHTML", function (message, html, data) {
  // common.util.chat.handleRenderedChatMessage({
  //   message: message,
  //   html: html,
  //   data: data,
  // });
});

Hooks.on("deleteChatMessage", function (args) {
  // common.util.chat.handleDeletionOfChatMessage(args);
});

Hooks.on("hoverToken", function (token) {
  // presentation.canvas.token.TokenExtensions.updateTokenHover(token);
});

Hooks.on("drawToken", function (token) {
  // presentation.canvas.token.TokenExtensions.updateTokenCombatant(token);
});

Hooks.on("refreshToken", function (token) {
  // presentation.canvas.token.TokenExtensions.updateTokenHover(token);
  // presentation.canvas.token.TokenExtensions.updateTokenCombatant(token);
});

Hooks.on("updateToken", function (document, change, options, userId) {
  // presentation.canvas.token.TokenExtensions.updateTokenHover(document.object);
  // presentation.canvas.token.TokenExtensions.updateTokenCombatant(document.object);
});

Hooks.on("updateActor", function (document, change, options, userId) {
  ui.combat?.render();
});

Hooks.on("createCombatant", function (document, options, userId) {
  // presentation.canvas.token.TokenExtensions.updateTokenCombatant(document.token.object);
});

Hooks.on("renderCombatTracker", function (document, options, userId) {
  // presentation.canvas.token.TokenExtensions.updateTokenCombatants();
});

Hooks.on("createProseMirrorEditor", (_uuid, plugins, _options) => {
  const Menu = CustomProseMirrorMenu;
  const { defaultSchema } = foundry.prosemirror;
  const options = plugins.menu.options;
  plugins.menu = Menu.build(defaultSchema, options);
});

// Handle STRIVE setting changes. 
Hooks.on("striveSettingChanged", (args) => {
  const key = args[1];
  const newValue = args[2];

  if (key.includes(GameSystemUserSettings.KEY_USE_STRIVE_FONT)) {
    if (newValue) {
      $("body").addClass("strive-regular-font");
    } else {
      $("body").removeClass("strive-regular-font");
    }
  }

  if (key.includes(GameSystemUserSettings.KEY_TOGGLE_DEBUG)) {
    game.strive.debug = newValue;
  }

  if (key.includes(GameSystemUserSettings.KEY_TOGGLE_REMINDERS)) {
    game.strive.enableReminders = newValue;
  }
  
  if (key.includes(GameSystemUserSettings.KEY_TOGGLE_UNUSABLE_EXPERTISE_VISIBILITY)) {
    game.strive.enableUnusableExpertiseExpansion = newValue;
  }
});
