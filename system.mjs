// Root Globals
import { WorldSystemVersion } from "./business/migration/world-system-version.mjs";
import { common } from "./common/_module.mjs";
import { business } from "./business/_module.mjs";
import { presentation } from "./presentation/_module.mjs";
// Handlebars
import { HANDLEBARS_GLOBALS } from "./presentation/utility/handlebars-globals.mjs";
// Utility
import { KEYBOARD } from "./presentation/keyboard/keyboard.mjs";
import VersionCode from "./business/migration/version-code.mjs";
import DamageDesignerDialog from "./presentation/dialog/damage-designer-dialog/damage-designer-dialog.mjs";
import DicePoolDesignerDialog from "./presentation/dialog/dice-pool-designer-dialog/dice-pool-designer-dialog.mjs";
// Migration
import MigratorInitiator from "./business/migration/migrator-initiator.mjs";
import MigratorDialog from "./presentation/dialog/migrator-dialog/migrator-dialog.mjs";
// Dialogs
import PlainDialog from "./presentation/dialog/plain-dialog/plain-dialog.mjs";
import BulkUpdateDialog from "./presentation/dialog/bulk-update-dialog/bulk-update-dialog.mjs";
// View models
import ViewModelCollection from './presentation/view-model/view-model-collection.mjs';
import { setting } from "./business/setting/_module.mjs";

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // Ensure the system's namespace exists. 
  // Adds system specific logic to the global namespace. 
  game.strive = {
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
     * The global collection of view models. 
     * 
     * Any newly instantiated view models will be added to this list. Then, during their activateListeners-call, 
     * they'll pull (remove) themselves from this list and add themselves to their corresponding owner. 
     * An owner could be an {ActorSheet} or {ItemSheet}. 
     * @type {ViewModelCollection}
     */
    viewModels: new ViewModelCollection(),
    /**
     * The global view states map. 
     * 
     * @type {Map<String, Object>}
     */
    viewStates: new Map(),
    
    // Module namespaces. 
    business: business,
    common: common,
    presentation: presentation,

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

Hooks.once('setup', function() {
  // Initialize global Handlebars helpers and partials.
  HANDLEBARS_GLOBALS.initHandlebarsHelpers();
  HANDLEBARS_GLOBALS.initHandlebarsPartials();
});

Hooks.once("ready", function() {
  business.ready();
  presentation.ready();

  // Debug mode setting. 
  game.strive.debug = setting.GameSystemUserSettings.get(setting.GameSystemUserSettings.KEY_TOGGLE_DEBUG);

  // Global event handling setup.
  KEYBOARD.init();

  // Migration check. 
  const migrator = new MigratorInitiator();
  
  if (migrator.isApplicable() === true) {
    if (game.user.isGM === true) {
      new MigratorDialog().render(true);
    } else {
      // Display warning to non-GM. 
      new PlainDialog({
        localizedTitle: game.i18n.localize("system.migration.titleMigrationRequired"),
        localizedContent: game.i18n.localize("system.migration.migrationRequiredUserWarning"),
      }).render(true);
    }
  } else {
    game.strive.logger.logVerbose("Version up to date - skipping migrations");
    // Ensure the current system version is saved. 
    WorldSystemVersion.set(migrator.finalMigrationVersion);
  }

  // Register dev dialogs, if necessary.
  if (game.strive.debug) {
    window.runMigration = async function(fromVersion) {
      // Fake world system version. Without this, migrators might not run. 
      const fakeVersion = VersionCode.fromString(fromVersion);
      await WorldSystemVersion.set(fakeVersion);
      
      new MigratorDialog().render(true);
    };

    window.BulkUpdateDialog = BulkUpdateDialog;
    window.DicePoolDesignerDialog = DicePoolDesignerDialog;
    window.DamageDesignerDialog = DamageDesignerDialog;
  }
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessageHTML", function(message, html, data) {
  common.util.chat.handleRenderedChatMessage({
    message: message,
    html: html,
    data: data,
  });
});

Hooks.on("deleteChatMessage", function(args) {
  common.util.chat.handleDeletionOfChatMessage(args);
});

Hooks.on("hoverToken", function(token) {
  presentation.canvas.token.TokenExtensions.updateTokenHover(token);
});

Hooks.on("drawToken", function(token) {
  presentation.canvas.token.TokenExtensions.updateTokenCombatant(token);
});

Hooks.on("refreshToken", function(token) {
  presentation.canvas.token.TokenExtensions.updateTokenHover(token);
  presentation.canvas.token.TokenExtensions.updateTokenCombatant(token);
});

Hooks.on("updateToken", function(document, change, options, userId) {
  presentation.canvas.token.TokenExtensions.updateTokenHover(document.object);
  presentation.canvas.token.TokenExtensions.updateTokenCombatant(document.object);
});

Hooks.on("updateActor", function(document, change, options, userId) {
  ui.combat?.render();
});

Hooks.on("createCombatant", function(document, options, userId) {
  presentation.canvas.token.TokenExtensions.updateTokenCombatant(document.token.object);
});

Hooks.on("renderCombatTracker", function(document, options, userId) {
  presentation.canvas.token.TokenExtensions.updateTokenCombatants();
});
