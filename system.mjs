// Ruleset
import { ATTRIBUTES } from "./business/ruleset/attributes.mjs";
import { ATTRIBUTE_GROUPS } from "./business/ruleset/attribute-groups.mjs";
import { DAMAGE_TYPES } from "./business/ruleset/damage-types.mjs";
import { ATTACK_TYPES } from "./business/ruleset/skill/attack-types.mjs";
import { SHIELD_TYPES } from "./business/ruleset/asset/shield-types.mjs";
import { ARMOR_TYPES } from "./business/ruleset/asset/armor-types.mjs";
import { WEAPON_TYPES } from "./business/ruleset/asset/weapon-types.mjs";
import { INJURY_STATES } from "./business/ruleset/injury-states.mjs";
import { ILLNESS_STATES } from "./business/ruleset/illness-states.mjs";
import Ruleset from "./business/ruleset/ruleset.mjs";
// Chat constants
import { VISIBILITY_MODES } from "./presentation/chat/visibility-modes.mjs";
// Utility
import { TEMPLATES, preloadHandlebarsTemplates } from "./presentation/template/templatePreloader.mjs";
import { findDocument } from "./business/util/content-utility.mjs";
import ChoiceOption from "./presentation/util/choice-option.mjs";
import { getAsChoices } from "./business/util/constants-utility.mjs";
// Migration
import MigratorInitiator from "./business/migration/migrator-initiator.mjs";
import MigratorDialog from "./presentation/dialog/migrator-dialog/migrator-dialog.mjs";
import LoadDebugSettingUseCase from "./business/use-case/load-debug-setting-use-case.mjs";
// Dialogs
import PlainDialog from "./presentation/dialog/plain-dialog/plain-dialog.mjs";
// Document classes
import { AmbersteelActor } from "./business/document/actor/actor.mjs";
import { AmbersteelItem } from "./business/document/item/item.mjs";
// Sheet classes
import { AmbersteelActorSheet } from "./presentation/sheet/actor/actor-sheet.mjs";
import { AmbersteelItemSheet } from "./presentation/sheet/item/item-sheet.mjs";
// Import logging classes
import { BaseLoggingStrategy, LogLevels } from "./business/logging/base-logging-strategy.mjs";
import { ConsoleLoggingStrategy } from "./business/logging/console-logging-strategy.mjs";
// Import settings classes
import AmbersteelUserSettings from "./business/setting/ambersteel-user-settings.mjs";
// Import view models
import './presentation/view-model/view-model.mjs';
import ViewModelCollection from './presentation/view-model/view-model-collection.mjs';
// Components
import './presentation/view-model/input-view-model.mjs';
import './presentation/component/label/label-viewmodel.mjs';
import './presentation/component/input-textfield/input-textfield-viewmodel.mjs';
import './presentation/component/input-dropdown/input-dropdown-viewmodel.mjs';
import './presentation/component/input-number-spinner/input-number-spinner-viewmodel.mjs';
import './presentation/component/input-textarea/input-textarea-viewmodel.mjs';
import './presentation/component/input-radio-button-group/input-radio-button-group-viewmodel.mjs';
import './presentation/component/item-grid/item-grid-view-viewmodel.mjs';
import './presentation/component/button/button-viewmodel.mjs';
import './presentation/component/button-add/button-add-viewmodel.mjs';
import './presentation/component/button-delete/button-delete-viewmodel.mjs';
import './presentation/component/button-open-sheet/button-open-sheet-viewmodel.mjs';
import './presentation/component/button-roll/button-roll-viewmodel.mjs';
import './presentation/component/button-send-to-chat/button-send-to-chat-viewmodel.mjs';
import './presentation/component/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs';
import './presentation/component/button-take-item/button-take-item-viewmodel.mjs';
import './presentation/component/sortable-list/sortable-list-viewmodel.mjs';
import './presentation/component/section-gm-notes/section-gm-notes-viewmodel.mjs';
// View models
import './presentation/template/actor/actor-sheet-viewmodel.mjs';
import './presentation/template/actor/component/component-attribute-table-viewmodel.mjs';
import './presentation/template/actor/part/actor-assets-viewmodel.mjs';
import './presentation/template/actor/part/actor-attributes-viewmodel.mjs';
import './presentation/template/actor/part/actor-beliefs-fate-viewmodel.mjs';
import './presentation/template/actor/part/actor-beliefs-viewmodel.mjs';
import './presentation/template/actor/part/actor-biography-viewmodel.mjs';
import './presentation/template/actor/part/actor-fate-viewmodel.mjs';
import './presentation/template/actor/part/actor-health-viewmodel.mjs';
import './presentation/template/actor/part/actor-personals-viewmodel.mjs';
import './presentation/template/actor/part/actor-skills-viewmodel.mjs';
// View model factory
import './presentation/view-model/view-model-factory.mjs';

/* -------------------------------------------- */
/*  Initialization                              */
/* -------------------------------------------- */

Hooks.once('init', function() {
  // Add system specific logic to global namespace. 
  game.ambersteel = {
    AmbersteelActor,
    AmbersteelItem,
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
     * The global collection of view models. 
     * 
     * Any newly instantiated view models will be added to this list. Then, during their activateListeners-call, 
     * they'll pull (remove) themselves from this list and add themselves to their corresponding owner. 
     * An owner could be an {ActorSheet} or {ItemSheet}. 
     * @type {ViewModelCollection}
     */
    viewModels: new ViewModelCollection(),
    /**
     * 
     * @type {Map<String, Object>}
     */
    viewStates: new Map(),
    /**
     * Returns an array of {ChoiceOption}s. 
     * @param {Object} configObject Any config property.
     * @returns {Array<ChoiceOption>}
     */
    getOptionsFromConfig: function(configObject) {
      const result = [];

      for (const entryName in configObject) {
        const entry = configObject[entryName];
        const localizedName = entry.localizableName !== undefined ? game.i18n.localize(entry.localizableName) : undefined;
        const icon = entry.icon;

        result.push(new ChoiceOption({
          value: entry.name, 
          localizedValue: localizedName, 
          icon: icon,
          shouldDisplayValue: localizedName !== undefined ? true : false,
          shouldDisplayIcon: icon !== undefined ? true : false,
        }));
      }

      return result;
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getDamageTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(DAMAGE_TYPES);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getAttackTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ATTACK_TYPES);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getShieldTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(SHIELD_TYPES);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getArmorTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ARMOR_TYPES);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getWeaponTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(WEAPON_TYPES);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getVisibilityOptions: function() {
      return game.ambersteel.getOptionsFromConfig(VISIBILITY_MODES);
    },
    /**
     * Returns the config item of the given config object, whose name matches with the given name. 
     * @param {Object} configObject Any config property. 
     * @param {String} name Name of the config item to fetch. 
     * @returns {Object | undefined}
     */
    getConfigItem: function(configObject, name) {
      for (const propertyName in configObject) {
        const obj = configObject[propertyName];

        if (obj.name === name) {
          return obj;
        }
      }

      return undefined;
    },
  };

  // Set initiative formula on global CONFIG variable provided by FoundryVTT.
  CONFIG.Combat.initiative = {
    formula: "1d100",
    decimals: 2
  };

  // Define custom Document classes on global CONFIG variable provided by FoundryVTT.
  CONFIG.Actor.documentClass = AmbersteelActor;
  CONFIG.Item.documentClass = AmbersteelItem;

  // Register sheet application classes. 
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("ambersteel", AmbersteelActorSheet, { makeDefault: true });
  
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("ambersteel", AmbersteelItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

Hooks.once("ready", function() {
  // Ensure constants provide a 'asChoices' property. 
  ATTRIBUTES.asChoices = getAsChoices(ATTRIBUTES, ["asChoices"]);
  ATTRIBUTE_GROUPS.asChoices = getAsChoices(ATTRIBUTE_GROUPS, ["asChoices"]);
  DAMAGE_TYPES.asChoices = getAsChoices(DAMAGE_TYPES, ["asChoices"]);
  ATTACK_TYPES.asChoices = getAsChoices(ATTACK_TYPES, ["asChoices"]);
  SHIELD_TYPES.asChoices = getAsChoices(SHIELD_TYPES, ["asChoices"]);
  ARMOR_TYPES.asChoices = getAsChoices(ARMOR_TYPES, ["asChoices"]);
  WEAPON_TYPES.asChoices = getAsChoices(WEAPON_TYPES, ["asChoices"]);
  INJURY_STATES.asChoices = getAsChoices(INJURY_STATES, ["asChoices"]);
  ILLNESS_STATES.asChoices = getAsChoices(ILLNESS_STATES, ["asChoices"]);

  // Settings initialization.
  new AmbersteelUserSettings().ensureAllSettings();

  // Debug mode setting. 
  game.ambersteel.debug = new LoadDebugSettingUseCase().invoke();

  // Migration check. 
  const migrator = new MigratorInitiator();
  
  if (migrator.isApplicable() === true) {
    if (game.user.isGM === true) {
      new MigratorDialog().render(true);
    } else {
      // Display warning to non-GM. 
      new PlainDialog({
        localizedTitle: game.i18n.localize("ambersteel.migration.titleMigrationRequired"),
        localizedContent: game.i18n.localize("ambersteel.migration.migrationRequiredUserWarning"),
      }).render(true);
    }
  } else {
    game.ambersteel.logger.logVerbose("Version up to date - skipping migrations");
  }
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

/**
 * Repeats the given `content` exactly `n` times. 
 * @param {Number} n The repetition count. 
 * @param {String} content The HTML content to repeat. 
 */
Handlebars.registerHelper('times', function(n, content) {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += content.fn(i);
  }

  return result;
});

/**
 * Returns `true`, if the given parameters are considered equal. Otherwise, returns `false`. 
 * @param {Any} a
 * @param {Any} b
 * 
 * @returns {Boolean}
 */
Handlebars.registerHelper('eq', function(a, b) {
  return a == b;
});

/**
 * Returns `true`, if the given parameters are *not* considered equal. Otherwise, returns `false`. 
 * @param {Any} a
 * @param {Any} b
 * 
 * @returns {Boolean}
 */
Handlebars.registerHelper('neq', function(a, b) {
  return a != b;
});

/**
 * Returns `true`, if both of the given parameters are 'truth-y' values. Otherwise, returns `false`. 
 * @param {Any} a
 * @param {Any} b
 * 
 * @returns {Boolean}
 */
Handlebars.registerHelper('and', function(a, b) {
  return a && b;
});

/**
 * Returns `true`, if at least one of the given parameters is 'truth-y' values. Otherwise, returns `false`. 
 * @param {Any} a
 * @param {Any} b
 * 
 * @returns {Boolean}
 */
Handlebars.registerHelper('or', function(a, b) {
  return a || b;
});

/**
 * Returns the negated given value. 
 * @param {Any} a
 * 
 * @returns {Any | Boolean}
 */
Handlebars.registerHelper('not', function(a) {
  return !a;
});

/**
 * If the given condition is satisfied, returns `thenValue`, otherwise, returns `elseValue`. 
 * @param {Any} condition
 * @param {Any} thenValue
 * @param {Any} elseValue
 */
Handlebars.registerHelper('ifThenElse', function(condition, thenValue, elseValue) {
  if (condition) {
    return thenValue;
  } else {
    return elseValue;
  }
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("preCreateActor", function(document, createData, options, userId) {
  // This ensures the proper "default" image is set, upon creation of the document. 
  // TODO: Could this not be done by manipulating 'createData'?
  document.data.update({ img: document.defaultImg });
});

Hooks.on("preCreateItem", function(document, createData, options, userId) {
  // This ensures the proper "default" image is set, upon creation of the document. 
  // TODO: Could this not be done by manipulating 'createData'?
  document.data.update({ img: document.defaultImg });
});

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
    game.ambersteel.logger.logWarn(`renderChatMessage: Failed to get document ID from chat message`);
    return;
  }

  const document = await findDocument({ id: documentId });

  if (document === undefined) {
    game.ambersteel.logger.logWarn(`renderChatMessage: Failed to get document represented by chat message`);
    return;
  }
  
  let vm = game.ambersteel.viewModels.get(vmId);
  if (vm === undefined) {
    // Create new instance of a view model to associate with the chat message. 
    if (dataset.abilityIndex !== undefined) {
      // Create a skill ability chat view model. 
      const skillAbilityIndex = parseInt(dataset.abilityIndex);
      const skillAbility = document.data.data.abilities[skillAbilityIndex];
      vm = skillAbility.getChatViewModel({ id: vmId });
    } else {
      vm = document.getChatViewModel({ id: vmId });
    }

    if (vm === undefined) {
      game.ambersteel.logger.logWarn(`renderChatMessage: Failed to create view model for chat message`);
      return;
    }
    // Ensure the view model is stored in the global collection. 
    game.ambersteel.viewModels.set(vmId, vm);
  }

  vm.activateListeners(html, vm.isOwner, vm.isEditable);
});

Hooks.on("deleteChatMessage", function(args) {
  const deletedContent = args.data.content;
  const rgxViewModelId = /data-view-model-id="([^"]*)"/;
  const match = deletedContent.match(rgxViewModelId);

  if (match !== undefined && match !== null && match.length === 2) {
    const vmId = match[1];

    // Dispose the view model, if it supports it. 
    const vm = game.ambersteel.viewModels.get(vmId);

    if (vm === undefined) return;

    if (vm.dispose !== undefined) {
      try {
        vm.dispose();
      } catch (error) {
        // It may already be disposed, in which case it might throw an error. 
        // Of course, if it is already disposed, the error isn't actually a problem. 
        game.ambersteel.logger.logVerbose(error);
      }
    }

    // Remove the view model from the global collection. 
    game.ambersteel.viewModels.remove(vmId);
  }
});