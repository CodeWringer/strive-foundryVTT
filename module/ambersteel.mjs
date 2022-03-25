// Import main config.
import { ambersteel as ambersteelConfig } from "./config.js"
// Import document classes.
import { AmbersteelActor } from "./documents/actor.mjs";
import { AmbersteelItem } from "./documents/item.mjs";
// Import sheet classes.
import { AmbersteelActorSheet } from "./sheets/actor-sheet.mjs";
import { AmbersteelItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./templatePreloader.mjs";
import { getNestedPropertyValue, ensureNestedProperty, setNestedPropertyValue } from "./utils/property-utility.mjs";
import { findDocument } from "./utils/content-utility.mjs";
import AdvancementRequirements from "./dto/advancement-requirement.mjs";
import { TEMPLATES } from "./templatePreloader.mjs";
import { createUUID } from './utils/uuid-utility.mjs';
import ChoiceOption from "./dto/choice-option.mjs";
// Import logging classes. 
import { BaseLoggingStrategy, LogLevels } from "./logging/base-logging-strategy.mjs";
import { ConsoleLoggingStrategy } from "./logging/console-logging-strategy.mjs";
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
    /**
     * Returns the number of dice for a skill test. 
     * @param {Number} skillValue A skill level. 
     * @param {Number} relatedAttributeValue Level of the skill related attribute. 
     * @returns {Object} { totalDiceCount: {Number}, skillDiceCount: {Number}, attributeDiceCount: {Number} }
     */
    getSkillTestNumberOfDice: function(skillLevel, relatedAttributeLevel) {
      const attributeDice = skillLevel == 0 ? parseInt(Math.ceil(relatedAttributeLevel / 2)) : parseInt(Math.floor(relatedAttributeLevel / 2));
      return {
        totalDiceCount: skillLevel + attributeDice,
        skillDiceCount: skillLevel,
        attributeDiceCount: attributeDice
      };
    },
    /**
     * Returns the advancement requirements for the given level of an attribute. 
     * 
     * If level is equal to 0, will return undefined, instead of actual values. 
     * This is deliberate, as an attribute at level 0 cannot be advanced (naturally).
     * @param {Number} level The level for which to get the advancement requirements. 
     * @returns {AdvancementRequirements}
     */
    getAttributeAdvancementRequirements: function(level = 0) {
      return new AdvancementRequirements({
        requiredSuccessses: (level == 0) ? undefined : (level + 1) * (level + 1) * 3,
        requiredFailures: (level == 0) ? undefined : (level + 1) * (level + 1) * 4
      });
    },
    /**
     * Returns the advancement requirements for the given level of a skill. 
     * @param {Number} level The level for which to get the advancement requirements. 
     * @returns {AdvancementRequirements}
     */
    getSkillAdvancementRequirements: function(level = 0) {
      return new AdvancementRequirements({
        requiredSuccessses: (level == 0) ? 10 : (level + 1) * level * 2,
        requiredFailures: (level == 0) ? 14 : (level + 1) * level * 3
      });
    },
    /**
     * Returns the name of the attribute group containing the given attribute. 
     * @param attributeName {String} Internal name of an attribute, e.g. 'arcana'. 
     * @returns {String} Name of the attribute group, e. g. 'physical'. 
     */
    getAttributeGroupName: function(attributeName) {
      const attGroups = CONFIG.ambersteel.character.attributeGroups;
      for (const attGroupName in attGroups) {
        for (const attName in attGroups[attGroupName].attributes) {
          if (attName == attributeName) {
            return attGroupName;
          }
        }
      }
    },
    /**
     * Returns true, if the given face/number represents a positive (= success).
     * @param {String|Number} face A die face to check whether it represents a positive (= success).
     * @returns {Boolean}
     */
    isPositive: function(face) {
      const int = parseInt(face);
      return int === 6 || int === 5;
    },
    /**
     * Returns true, if the given face/number represents a spell-backfire-causing negative. 
     * @param {String|Number} face A die face to check whether it represents a spell-backfire-causing negative. 
     * @returns {Boolean}
     */
    causesBackfire: function(face) {
      const int = parseInt(face);
      return int === 1 || int === 2;
    },
    getCharacterMaximumHp: function(actor) {
      const businessData = actor.data.data;
      const injuryCount = actor.injuries.length;
      return (businessData.attributes.physical.toughness.value * 2) - (injuryCount * 2);
    },
    getCharacterMaximumInjuries: function(actor) {
      return Math.max(Math.floor(actor.data.data.attributes.physical.toughness.value / 2) + 1, 1);
    },
    getCharacterMaximumExhaustion: function(actor) {
      return actor.data.data.attributes.physical.endurance.value * 2;
    },
    getCharacterMaximumInventory: function(actor) {
      return actor.data.data.attributes.physical.strength.value * 3;
    },
    /**
     * Returns true, if the given actor must do toughness tests, whenever they suffer an injury. 
     * @param actor 
     * @returns {Boolean} True, if any further injury requires a toughness test. 
     */
    isToughnessTestRequired: function(actor) {
      const businessData = actor.data.data;
      const maxInjuries = businessData.health.maxInjuries;
      const injuryCount = actor.injuries.length;
      if (injuryCount >= Math.ceil(maxInjuries / 2)) {
        return true;
      } else {
        return false;
      }
    },
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
     * @param {Object} Any CONFIG property. 
     * @returns {Array<ChoiceOption>}
     */
    getOptionsFromConfig: function(configObject) {
      const result = [];

      for (const entryName in configObject) {
        const entry = configObject[entryName];
        const localizedName = game.i18n.localize(entry.localizableName);
        result.push(new ChoiceOption(entry.name, localizedName));
      }

      return result;
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getAttributeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.character.attributes);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getInjuryOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.injuryStates);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getIllnessOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.illnessStates);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getDamageTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.damageTypes);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getAttackTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.attackTypes);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getShieldTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.shieldTypes);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getArmorTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.armorTypes);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getWeaponTypeOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.weaponTypes);
    },
    /**
     * Returns an array of {ChoiceOption}s. 
     * @returns {Array<ChoiceOption>}
     */
    getVisibilityOptions: function() {
      return game.ambersteel.getOptionsFromConfig(ambersteelConfig.visibilityModes);
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

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  let outStr = '';
  for (let arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('times', function(n, content) {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += content.fn(i);
  }

  return result;
});

Handlebars.registerHelper('eq', function(a, b) {
  return a == b;
});

Handlebars.registerHelper('neq', function(a, b) {
  return a != b;
});

Handlebars.registerHelper('and', function(a, b) {
  return a && b;
});

Handlebars.registerHelper('or', function(a, b) {
  return a || b;
});

Handlebars.registerHelper('not', function(a) {
  return !a;
});

Handlebars.registerHelper('obj', function(a) {
  return {};
});

Handlebars.registerHelper('ifThenElse', function(condition, thenValue, elseValue) {
  if (condition) {
    return thenValue;
  } else {
    return elseValue;
  }
});

Handlebars.registerHelper('arrayFrom', function(arrayString) {
  let cleaned = arrayString.trim()
  cleaned = cleaned.substring(1, cleaned.length - 1);
  const splits = cleaned.split(",");
  const result = [];
  for (const split of splits) {
    const indexColon = split.indexOf(":");

    if (indexColon < 0) {
      result.push({ key: split.trim(), value: undefined });
    } else {
      result.push({ 
        key: split.substring(0, indexColon).trim(),
        value: split.substring(indexColon + 1).trim()
      });
    }
  }
  return result;
});

Handlebars.registerHelper('getValue', function(context, propertyPath) {
  return getNestedPropertyValue(context, propertyPath);
});

Handlebars.registerHelper('isDefined', function() {
  for (const arg in arguments) {
    const argValue = arguments[arg];
    if (argValue !== undefined) {
      return argValue;
    }
  }
  return undefined;
});

Handlebars.registerHelper('generateId', function() {
  return createUUID();
});

// If the given 'obj' has a property found via the given 'propertyPath', its value will be returned. 
// Otherwise, if the property doesn't yet exist, it will be created and its value 
// set to the given 'defaultValue'. 
Handlebars.registerHelper('getEnsured', function(obj, propertyPath, defaultValue) {
  ensureNestedProperty(obj, propertyPath, defaultValue);
  return getNestedPropertyValue(obj, propertyPath);
});

// Returns an invocable function that, once invoked, will set the given object's 
// property, identified by the given path, to the given value. 
// The returned function need only be invoked. No arguments need to be passed. 
Handlebars.registerHelper('setCallback', function(obj, propertyPath, value) {
  // This defines the actual callback function. 
  const f = (obj, propertyPath, value) => {
    ensureNestedProperty(obj, propertyPath, value);
    setNestedPropertyValue(obj, propertyPath, value);
  };
  // This wraps a concrete call to the callback function in an 
  // instance of an anonymous function. This is necessary to prevent 
  // the actual callback function to be invoked prematurely and 
  // wraps the given arguments in a concrete call. 
  // This means that the returned function need only be invoked 
  // as any other function without arguments. 
  return () => { f(obj, propertyPath, value) };
});

/* -------------------------------------------- */
/*  Handlebars Partials                         */
/* -------------------------------------------- */

// Input components
Handlebars.registerPartial('inputLabel', `{{#> "${TEMPLATES.COMPONENT_INPUT_LABEL}"}}{{/"${TEMPLATES.COMPONENT_INPUT_LABEL}"}}`);

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

// Hooks.once("ready", async function() {
// 
// });

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

  const document = await findDocument(documentId);

  if (document === undefined) {
    game.ambersteel.logger.logWarn(`renderChatMessage: Failed to get document represented by chat message`);
    return;
  }
  
  let vm = game.ambersteel.viewModels.get(vmId);
  if (vm === undefined) {
    // Create new instance of a view model to associate with the chat message. 
    vm = document.getChatViewModel({ id: vmId });
    if (vm === undefined) {
      game.ambersteel.logger.logWarn(`renderChatMessage: Failed to create view model for chat message`);
      return;
    }
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