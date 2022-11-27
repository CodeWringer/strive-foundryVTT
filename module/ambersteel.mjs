// Import constants.
import { ATTRIBUTES } from "./constants/attributes.mjs";
import { DAMAGE_TYPES } from "./constants/damage-types.mjs";
import { ATTACK_TYPES } from "./constants/attack-types.mjs";
import { SHIELD_TYPES } from "./constants/shield-types.mjs";
import { ARMOR_TYPES } from "./constants/armor-types.mjs";
import { WEAPON_TYPES } from "./constants/weapon-types.mjs";
import { VISIBILITY_MODES } from "./constants/visibility-modes.mjs";
import { INJURY_STATES } from "./constants/injury-states.mjs";
import { ILLNESS_STATES } from "./constants/illness-states.mjs";
// Import main config.
import { ambersteel as ambersteelConfig } from "./config.js"
import * as DialogUtil from "./utils/dialog-utility.mjs";
import MigratorInitiator from "./migration/migrator-initiator.mjs";
import MigratorDialog from "./migration/presentation/migrator-dialog.mjs";
// Import document classes.
import { AmbersteelActor } from "./documents/actor.mjs";
import { AmbersteelItem } from "./documents/item.mjs";
// Import sheet classes.
import { AmbersteelActorSheet } from "./sheets/actor-sheet.mjs";
import { AmbersteelItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import Ruleset from "./ruleset.mjs";
import { preloadHandlebarsTemplates } from "./templatePreloader.mjs";
import { getNestedPropertyValue, ensureNestedProperty, setNestedPropertyValue } from "./utils/property-utility.mjs";
import { findDocument } from "./utils/content-utility.mjs";
import { TEMPLATES } from "./templatePreloader.mjs";
import { createUUID } from './utils/uuid-utility.mjs';
import ChoiceOption from "./dto/choice-option.mjs";
// Import logging classes. 
import { BaseLoggingStrategy, LogLevels } from "./logging/base-logging-strategy.mjs";
import { ConsoleLoggingStrategy } from "./logging/console-logging-strategy.mjs";
// Import settings classes. 
import AmbersteelUserSettings from "./settings/ambersteel-user-settings.mjs";
// Import view models. 
import './components/viewmodel.mjs';
import './components/sheet-viewmodel.mjs';
import ViewModelCollection from './utils/viewmodel-collection.mjs';
// Import components. 
import './components/input-viewmodel.mjs';
import './components/input-textfield/input-textfield-viewmodel.mjs';
import './components/input-dropdown/input-dropdown-viewmodel.mjs';
import './components/input-number-spinner/input-number-spinner-viewmodel.mjs';
import './components/input-textarea/input-textarea-viewmodel.mjs';
import './components/input-radio-button-group/input-radio-button-group-viewmodel.mjs';
import './components/item-grid/item-grid-view-viewmodel.mjs';
import './components/button/button-viewmodel.mjs';
import './components/button-add/button-add-viewmodel.mjs';
import './components/button-delete/button-delete-viewmodel.mjs';
import './components/button-open-sheet/button-open-sheet-viewmodel.mjs';
import './components/button-roll/button-roll-viewmodel.mjs';
import './components/button-send-to-chat/button-send-to-chat-viewmodel.mjs';
import './components/button-toggle-visibility/button-toggle-visibility-viewmodel.mjs';
import './components/button-take-item/button-take-item-viewmodel.mjs';
import './components/sortable-list/sortable-list-viewmodel.mjs';
// Import ui view models. 
import '../templates/gm-notes-viewmodel.mjs';
import '../templates/actor/actor-sheet-viewmodel.mjs';
import '../templates/actor/components/component-attribute-table-viewmodel.mjs';
import '../templates/actor/components/component-skill-table-viewmodel.mjs';
import '../templates/actor/parts/actor-assets-viewmodel.mjs';
import '../templates/actor/parts/actor-attributes-viewmodel.mjs';
import '../templates/actor/parts/actor-beliefs-fate-viewmodel.mjs';
import '../templates/actor/parts/actor-beliefs-viewmodel.mjs';
import '../templates/actor/parts/actor-biography-viewmodel.mjs';
import '../templates/actor/parts/actor-fate-viewmodel.mjs';
import '../templates/actor/parts/actor-health-viewmodel.mjs';
import '../templates/actor/parts/actor-personals-viewmodel.mjs';
import '../templates/actor/parts/actor-skills-viewmodel.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {
  // Add config and constants to global namespace. 
  CONFIG.ambersteel = ambersteelConfig;

  // Add system specific logic to global namespace. 
  game.ambersteel = {
    AmbersteelActor,
    AmbersteelItem,
    /**
     * The global configuration and constants of the system. 
     * @type {Object}
     */
    config: ambersteelConfig,
    // TODO: #29 Make debug dependent on build settings. 
    /**
     * 
     * @type {BaseLoggingStrategy}
     */
    logger: new ConsoleLoggingStrategy(LogLevels.DEBUG),
    /**
     * @type {Boolean}
     * @private
     */
    _debug: true,
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
        this.logger = new ConsoleLoggingStrategy(LogLevels.DEBUG);
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
    getAttributeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ATTRIBUTES);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getInjuryOptions: function() {
      return game.ambersteel.getOptionsFromConfig(INJURY_STATES);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getIllnessOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ILLNESS_STATES);
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

  // Set initiative formula. 
  CONFIG.Combat.initiative = {
    formula: "1d100",
    decimals: 2
  };

  // Define custom Document classes. 
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
/*  Handlebars Partials                         */
/* -------------------------------------------- */

// Input components
Handlebars.registerPartial('inputLabel', `{{#> "${TEMPLATES.COMPONENT_INPUT_LABEL}"}}{{/"${TEMPLATES.COMPONENT_INPUT_LABEL}"}}`);

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Settings initialization.
  new AmbersteelUserSettings().ensureAllSettings();

  // Migration check. 
  const migrator = new MigratorInitiator();
  
  if (migrator.isApplicable() === true) {
    if (game.user.isGM === true) {
      new MigratorDialog().render(true);
    } else {
      // Display warning to non-GM. 
      await DialogUtil.showPlainDialog({
        localizedTitle: game.i18n.localize("ambersteel.migration.titleMigrationRequired"),
        localizedContent: game.i18n.localize("ambersteel.migration.migrationRequiredUserWarning"),
      });
    }
  } else {
    game.ambersteel.logger.logVerbose("Version up to date - skipping migrations");
  }
});

Hooks.on("preCreateActor", async function(document, createData, options, userId) {
  // This ensures the proper "default" image is set, upon creation of the document. 
  document.data.update({ img: document.defaultImg });
});

Hooks.on("preCreateItem", async function(document, createData, options, userId) {
  // This ensures the proper "default" image is set, upon creation of the document. 
  document.data.update({ img: document.defaultImg });
});

// Hooks.on("createActor", async function(document, options, userId) {
//   console.log("created!");
// });

// Hooks.on("deleteActor", async function(document, options, userId) {
//   console.log("deleted!");
// });

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

// Hooks.on("preDeleteChatMessage", async function(args) {
// });

Hooks.on("deleteChatMessage", async function(args) {
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