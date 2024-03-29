// Root Globals
import { SYSTEM_ID } from "./system-id.mjs";
import { WorldSystemVersion } from "./business/migration/world-system-version.mjs";
// Handlebars
import { TEMPLATES, preloadHandlebarsTemplates } from "./presentation/templatePreloader.mjs";
import { initHandlebarsHelpers, initHandlebarsPartials } from "./presentation/handlebars-globals/handlebars-globals.mjs";
import { initHandlebarsComponents } from "./presentation/handlebars-globals/handlebars-components.mjs";
// Ruleset
import { ATTRIBUTES } from "./business/ruleset/attribute/attributes.mjs";
import { ATTRIBUTE_GROUPS } from "./business/ruleset/attribute/attribute-groups.mjs";
import { DAMAGE_TYPES } from "./business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "./business/ruleset/skill/attack-types.mjs";
import { SHIELD_TYPES } from "./business/ruleset/asset/shield-types.mjs";
import { ARMOR_TYPES } from "./business/ruleset/asset/armor-types.mjs";
import { WEAPON_TYPES } from "./business/ruleset/asset/weapon-types.mjs";
import { INJURY_STATES } from "./business/ruleset/health/injury-states.mjs";
import { ILLNESS_STATES } from "./business/ruleset/health/illness-states.mjs";
import { HEALTH_STATES } from "./business/ruleset/health/health-states.mjs";
import { CHARACTER_TEST_TYPES } from "./business/ruleset/test/character-test-types.mjs";
import Ruleset from "./business/ruleset/ruleset.mjs";
// Chat constants
import { VISIBILITY_MODES } from "./presentation/chat/visibility-modes.mjs";
// Utility
import ChoiceOption from "./presentation/component/input-choice/choice-option.mjs";
import DocumentFetcher from "./business/document/document-fetcher/document-fetcher.mjs";
import TokenExtensions from "./presentation/token/token-extensions.mjs";
// Migration
import MigratorInitiator from "./business/migration/migrator-initiator.mjs";
import MigratorDialog from "./presentation/dialog/migrator-dialog/migrator-dialog.mjs";
import LoadDebugSettingUseCase from "./business/use-case/load-debug-setting-use-case.mjs";
// Dialogs
import PlainDialog from "./presentation/dialog/plain-dialog/plain-dialog.mjs";
import "./presentation/dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
// Document classes
import { ACTOR_SUBTYPE } from "./business/document/actor/actor-subtype.mjs";
import { GameSystemActor } from "./business/document/actor/actor.mjs";
import { ITEM_SUBTYPE } from "./business/document/item/item-subtype.mjs";
import { GameSystemItem } from "./business/document/item/item.mjs";
// Sheet classes
import { GameSystemActorSheet } from "./presentation/sheet/actor/actor-sheet.mjs";
import { GameSystemItemSheet } from "./presentation/sheet/item/item-sheet.mjs";
// Import logging classes
import { BaseLoggingStrategy, LogLevels } from "./business/logging/base-logging-strategy.mjs";
import { ConsoleLoggingStrategy } from "./business/logging/console-logging-strategy.mjs";
// Import settings classes
import GameSystemUserSettings from "./business/setting/game-system-user-settings.mjs";
import GameSystemWorldSettings from "./business/setting/game-system-world-settings.mjs";
// Import view models
import './presentation/view-model/view-model.mjs';
import ViewModelCollection from './presentation/view-model/view-model-collection.mjs';
// Components
import './presentation/view-model/input-view-model.mjs';
import './presentation/component/input-textfield/input-textfield-viewmodel.mjs';
import './presentation/component/input-dropdown/input-dropdown-viewmodel.mjs';
import './presentation/component/input-number-spinner/input-number-spinner-viewmodel.mjs';
import './presentation/component/input-textarea/input-textarea-viewmodel.mjs';
import './presentation/component/input-radio-button-group/input-radio-button-group-viewmodel.mjs';
import './presentation/component/button/button-viewmodel.mjs';
import './presentation/component/button-add/button-add-viewmodel.mjs';
import './presentation/component/button-delete/button-delete-viewmodel.mjs';
import './presentation/component/button-open-sheet/button-open-sheet-viewmodel.mjs';
import './presentation/component/button-roll/button-roll-viewmodel.mjs';
import './presentation/component/button-send-to-chat/button-send-to-chat-viewmodel.mjs';
import './presentation/component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs';
import './presentation/component/button-take-item/button-take-item-viewmodel.mjs';
import './presentation/component/button-toggle-icon/button-toggle-icon-viewmodel.mjs';
// Composites
import './presentation/component/sortable-list/sortable-list-viewmodel.mjs';
import './presentation/component/simple-list/simple-list-viewmodel.mjs';
import './presentation/component/section-gm-notes/section-gm-notes-viewmodel.mjs';
import './presentation/component/dice-roll-list/dice-roll-list-viewmodel.mjs';
import './presentation/component/damage-definition-list/damage-definition-list-item-viewmodel.mjs';
import './presentation/component/damage-definition-list/damage-definition-list-viewmodel.mjs';
import './presentation/component/lazy-load/lazy-load-viewmodel.mjs';
import './presentation/component/lazy-rich-text/lazy-rich-text-viewmodel.mjs';
import './presentation/component/visibility-toggle-list/visibility-toggle-list-viewmodel.mjs';
// View models
import './presentation/sheet/actor/actor-sheet-viewmodel.mjs';
import './presentation/sheet/actor/part/abilities/actor-attribute-table-viewmodel.mjs';
import './presentation/sheet/actor/part/abilities/actor-attributes-viewmodel.mjs';
import './presentation/sheet/actor/part/abilities/actor-skills-viewmodel.mjs';
import './presentation/sheet/actor/part/assets/actor-assets-viewmodel.mjs';
import './presentation/sheet/actor/part/personality/actor-personality-viewmodel.mjs';
import './presentation/sheet/actor/part/personality/actor-drivers-viewmodel.mjs';
import './presentation/sheet/actor/part/actor-biography-viewmodel.mjs';
import './presentation/sheet/actor/part/actor-fate-viewmodel.mjs';
import './presentation/sheet/actor/part/health/actor-health-viewmodel.mjs';
import './presentation/sheet/actor/part/actor-personals-viewmodel.mjs';
import { preloadPixiTextures } from "./presentation/pixi/pixi-preloader.mjs";
import CustomCombatTracker from "./presentation/combat/custom-combat-tracker.mjs";

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // Register globals. 
  window.DocumentFetcher = DocumentFetcher;

  // Add system specific logic to global namespace. 
  game.strive = {
    /**
     * 
     * @type {BaseLoggingStrategy}
     */
    logger: new ConsoleLoggingStrategy(LogLevels.ERROR),
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
        this.logger = new ConsoleLoggingStrategy(LogLevels.VERBOSE);
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
  };

  // Set initiative formula on global CONFIG variable provided by FoundryVTT.
  CONFIG.Combat.initiative = {
    formula: "1D10 + @baseInitiative",
    decimals: 2
  };

  // Override document classes. 
  CONFIG.Actor.documentClass = GameSystemActor;
  CONFIG.Item.documentClass = GameSystemItem;

  // Override combat tracker. 
  CONFIG.ui.combat = CustomCombatTracker;

  // Register sheet application classes. 
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(SYSTEM_ID, GameSystemActorSheet, { makeDefault: true });
  
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet(SYSTEM_ID, GameSystemItemSheet, { makeDefault: true });

  // Preload PIXI textures. 
  preloadPixiTextures();
  
  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

Hooks.once('setup', function() {
  // Register custom fonts.
  CONFIG.fontDefinitions["BlackChancery"] = {
    editor: true,
    fonts: [
      { urls: ["systems/strive/presentation/font/BLKCHCRY.TTF"] },
    ]
  };

  // Initialize global Handlebars helpers and partials.
  initHandlebarsHelpers();
  initHandlebarsPartials();
  // Initialize component Handlebars partials. 
  initHandlebarsComponents();
});

Hooks.once("ready", function() {
  // Settings initialization.
  new GameSystemUserSettings().ensureAllSettings();
  new GameSystemWorldSettings().ensureAllSettings();

  // Debug mode setting. 
  game.strive.debug = new LoadDebugSettingUseCase().invoke();

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
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", async function(message, html, data) {
  const SELECTOR_CHAT_MESSAGE = "custom-system-chat-message";
  const element = html.find(`.${SELECTOR_CHAT_MESSAGE}`)[0];
  
  // The chat message may just be a normal chat message, without any associated document. 
  // In such a case it is safe to skip any further operations, here. 
  if (element === undefined || element === null) return;

  // Get data set of element. This assumes the element in question to have the following data defined:
  // 'data-view-model-id' and 'data-document-id'
  const dataset = element.dataset;
  const vmId = dataset.viewModelId;
  const documentId = dataset.documentId;

  if (documentId === undefined) {
    return;
  }

  const document = await new DocumentFetcher().find({
    id: documentId,
    searchEmbedded: true,
    includeLocked: true,
  });

  if (document === undefined) {
    game.strive.logger.logWarn(`renderChatMessage: Failed to get document represented by chat message`);
    return;
  }
  
  let viewModel = game.strive.viewModels.get(vmId);
  if (viewModel === undefined) {
    // Create new instance of a view model to associate with the chat message. 
    if (dataset.expertiseId !== undefined) {
      // Create an expertise chat view model. 
      const expertiseId = dataset.expertiseId;
      const skillDocument = document.getTransientObject();
      const expertise = skillDocument.expertises.find(it => it.id === expertiseId);
      viewModel = expertise.getChatViewModel({ id: vmId });
    } else {
      viewModel = document.getTransientObject().getChatViewModel({ id: vmId });
    }

    if (viewModel === undefined) {
      game.strive.logger.logWarn(`renderChatMessage: Failed to create view model for chat message`);
      return;
    }
    // Ensure the view model is stored in the global collection. 
    if (game.strive.enableViewModelCaching === true) {
      game.strive.viewModels.set(vmId, viewModel);
    }
  }

  await viewModel.activateListeners(html);
});

Hooks.on("deleteChatMessage", function(args) {
  const deletedContent = args.content;
  const rgxViewModelId = /data-view-model-id="([^"]*)"/;
  const match = deletedContent.match(rgxViewModelId);

  if (match !== undefined && match !== null && match.length === 2) {
    const vmId = match[1];

    // Dispose the view model, if it supports it. 
    const vm = game.strive.viewModels.get(vmId);

    if (vm === undefined) return;

    if (vm.dispose !== undefined) {
      try {
        vm.dispose();
      } catch (error) {
        // It may already be disposed, in which case it might throw an error. 
        // Of course, if it is already disposed, the error isn't actually a problem. 
        game.strive.logger.logVerbose(error);
      }
    }

    // Remove the view model from the global collection. 
    game.strive.viewModels.remove(vmId);
  }
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
