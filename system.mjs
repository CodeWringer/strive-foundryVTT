// Root Globals
import { WorldSystemVersion } from "./business/migration/world-system-version.mjs";
import { common } from "./common/_module.mjs";
import { business } from "./business/_module.mjs";
import { presentation } from "./presentation/_module.mjs";
// Handlebars
import { TEMPLATES, preloadHandlebarsTemplates } from "./presentation/templatePreloader.mjs";
import { initHandlebarsHelpers, initHandlebarsPartials } from "./presentation/handlebars-globals/handlebars-globals.mjs";
import { initHandlebarsComponents } from "./presentation/handlebars-globals/handlebars-components.mjs";
// Constants
import { ATTRIBUTES } from "./business/model/const/attributes.mjs";
import { DAMAGE_TYPES } from "./business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "./business/ruleset/skill/attack-types.mjs";
import { SHIELD_TYPES } from "./business/ruleset/asset/shield-types.mjs";
import { ARMOR_TYPES } from "./business/ruleset/asset/armor-types.mjs";
import { WEAPON_TYPES } from "./business/ruleset/asset/weapon-types.mjs";
import { INJURY_STATES } from "./business/ruleset/health/injury-states.mjs";
import { ILLNESS_STATES } from "./business/ruleset/health/illness-states.mjs";
import { CHARACTER_TEST_TYPES } from "./business/ruleset/test/character-test-types.mjs";
import { ASSET_TAGS, SKILL_TAGS } from "./business/tags/system-tags.mjs";
import { ACTOR_TYPES } from "./business/model/document/actor/actor-types.mjs";
import { ITEM_TYPES } from "./business/model/document/item/item-types.mjs";
// Chat constants
import { VISIBILITY_MODES } from "./presentation/chat/visibility-modes.mjs";
// Utility
import DocumentFetcher from "./business/model/document/document-fetcher/document-fetcher.mjs";
import TokenExtensions from "./presentation/token/token-extensions.mjs";
import CustomCombatTracker from "./presentation/combat/custom-combat-tracker.mjs";
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
// HUD
import GameSystemTokenHud from "./presentation/token/game-system-token-hud.mjs";
// Import settings classes
import GameSystemUserSettings from "./business/setting/game-system-user-settings.mjs";
import GameSystemWorldSettings from "./business/setting/game-system-world-settings.mjs";
// View models
import ViewModelCollection from './presentation/view-model/view-model-collection.mjs';
// Utilities
import { PixiLoader } from "./presentation/pixi/pixi-preloader.mjs";
// Brokers
import SystemHealthConditionBroker from "./business/ruleset/health/system-health-condition-broker.mjs";

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // Register globals. 
  window.DocumentFetcher = DocumentFetcher;

  // Add system specific logic to global namespace. 
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
     * If `true`, view model caching is enabled. 
     * 
     * If `false`, view models will be re-instantiated every time a sheet is rendered or 
     * an underlying document updated. 
     * 
     * @type {Boolean}
     */
    enableViewModelCaching: false,
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
    // TODO #739 remove const field
    /**
     * Contains const definitions for use in modules that wish to extend the strive system. 
     * 
     * @type {Object}
     */
    const: {
      ATTRIBUTES: ATTRIBUTES,
      ACTOR_TYPES: ACTOR_TYPES,
      ITEM_TYPES: ITEM_TYPES,
      TEMPLATES: TEMPLATES,
      ASSET_TAGS: ASSET_TAGS,
      SKILL_TAGS: SKILL_TAGS,
      DAMAGE_TYPES: DAMAGE_TYPES,
      ATTACK_TYPES: ATTACK_TYPES,
      SHIELD_TYPES: SHIELD_TYPES,
      ARMOR_TYPES: ARMOR_TYPES,
      WEAPON_TYPES: WEAPON_TYPES,
      INJURY_STATES: INJURY_STATES,
      ILLNESS_STATES: ILLNESS_STATES,
      CHARACTER_TEST_TYPES: CHARACTER_TEST_TYPES,
      VISIBILITY_MODES: VISIBILITY_MODES,
    },
    // Module namespaces. 
    business: business,
    common: common,
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

  // Set initiative formula on global CONFIG variable provided by FoundryVTT.
  CONFIG.Combat.initiative = {
    formula: "1D20 + @baseInitiative",
    decimals: 0
  };

  // Override combat tracker. 
  CONFIG.ui.combat = CustomCombatTracker;

  // Override token hud.
  CONFIG.Token.hudClass = GameSystemTokenHud;

  // Preload PixiJs assets. 
  PixiLoader.preloadTextures();
  PixiLoader.preloadGraphics();
  
  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

Hooks.once('setup', function() {
  // Register custom fonts.
  CONFIG.fontDefinitions["StriveRegular"] = {
    editor: true,
    fonts: [
      { urls: ["systems/strive/presentation/font/STRIVE-Regular.ttf"] },
    ]
  };

  // Initialize global Handlebars helpers and partials.
  initHandlebarsHelpers();
  initHandlebarsPartials();
  // Initialize component Handlebars partials. 
  initHandlebarsComponents();

  // Broker preloading.
  SystemHealthConditionBroker.preload();
});

Hooks.once("ready", function() {
  // Settings initialization.
  new GameSystemUserSettings().ensureAllSettings();
  new GameSystemWorldSettings().ensureAllSettings();

  // Debug mode setting. 
  game.strive.debug = new GameSystemUserSettings().get(GameSystemUserSettings.KEY_TOGGLE_DEBUG);

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
  TokenExtensions.updateTokenHover(token);
});

Hooks.on("drawToken", function(token) {
  TokenExtensions.updateTokenCombatant(token);
});

Hooks.on("refreshToken", function(token) {
  TokenExtensions.updateTokenHover(token);
  TokenExtensions.updateTokenCombatant(token);
});

Hooks.on("updateToken", function(document, change, options, userId) {
  TokenExtensions.updateTokenHover(document.object);
  TokenExtensions.updateTokenCombatant(document.object);
});

Hooks.on("updateActor", function(document, change, options, userId) {
  ui.combat?.render();
});

Hooks.on("createCombatant", function(document, options, userId) {
  TokenExtensions.updateTokenCombatant(document.token.object);
});

Hooks.on("renderCombatTracker", function(document, options, userId) {
  TokenExtensions.updateTokenCombatants();
});
