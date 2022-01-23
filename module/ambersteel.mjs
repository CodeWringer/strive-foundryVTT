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
import { getNestedPropertyValue } from "./utils/property-utility.mjs";
import AdvancementRequirements from "./dto/advancement-requirement.mjs";
import { TEMPLATES } from "./templatePreloader.mjs";

import * as ListenerUtil from "./utils/listeners-utility.mjs";

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
     * @returns {Number} The number of D6 available for the test. 
     */
    getSkillTestNumberOfDice: function(skillLevel, relatedAttributeLevel) {
      return skillLevel == 0 ? parseInt(Math.ceil(relatedAttributeLevel / 2)) : parseInt(Math.floor(relatedAttributeLevel / 2)) + skillLevel;
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
      return Math.max(Math.floor(actor.data.data.attributes.physical.toughness.value / 2), 1);
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

Handlebars.registerHelper('lookupValue', function(context, propertyPath, itemId) {
  let propertyHolder = undefined;
  if (context.item) {
    propertyHolder = context.item;
  } else if (context.actor) {
    if (itemId) {
      propertyHolder = context.actor.items.get(itemId);
    } else {
      propertyHolder = context.actor;
    }
  } else {
    propertyHolder = context;
  }
  // Messy fix for context sometimes being a level deeper than it should. 
  if (propertyPath.startsWith("data.data")) {
    if (!hasProperty(propertyHolder, "data")) {
      console.warn(`PropertyHolder doesn't have 'data' property!`);
      console.warn(propertyHolder);
      return undefined;
    }
    if (!hasProperty(propertyHolder.data, "data")) {
      propertyPath = propertyPath.replace("data.data", "data");
    }
  }
  return getNestedPropertyValue(propertyHolder, propertyPath);
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

/* -------------------------------------------- */
/*  Handlebars Partials                         */
/* -------------------------------------------- */

// Components
Handlebars.registerPartial('buttonAdd', `{{#> "${TEMPLATES.COMPONENT_BUTTON_ADD}"}}{{/"${TEMPLATES.COMPONENT_BUTTON_ADD}"}}`);
Handlebars.registerPartial('buttonDelete', `{{#> "${TEMPLATES.COMPONENT_BUTTON_DELETE}"}}{{/"${TEMPLATES.COMPONENT_BUTTON_DELETE}"}}`);
Handlebars.registerPartial('buttonRoll', `{{#> "${TEMPLATES.COMPONENT_BUTTON_ROLL}"}}{{/"${TEMPLATES.COMPONENT_BUTTON_ROLL}"}}`);
Handlebars.registerPartial('buttonSendToChat', `{{#> "${TEMPLATES.COMPONENT_BUTTON_SEND_TO_CHAT}"}}{{/"${TEMPLATES.COMPONENT_BUTTON_SEND_TO_CHAT}"}}`);
Handlebars.registerPartial('numberSpinner', `{{#> "${TEMPLATES.COMPONENT_NUMBER_SPINNER}"}}{{> @partial-block }}{{/"${TEMPLATES.COMPONENT_NUMBER_SPINNER}"}}`);
Handlebars.registerPartial('inputComponent', `{{#> "${TEMPLATES.COMPONENT_INPUT}"}}{{/"${TEMPLATES.COMPONENT_INPUT}"}}`);
Handlebars.registerPartial('inputLabel', `{{#> "${TEMPLATES.COMPONENT_INPUT_LABEL}"}}{{/"${TEMPLATES.COMPONENT_INPUT_LABEL}"}}`);
Handlebars.registerPartial('buttonOpenSheet', `{{#> "${TEMPLATES.COMPONENT_BUTTON_OPEN_SHEET}"}}{{/"${TEMPLATES.COMPONENT_BUTTON_OPEN_SHEET}"}}`);
Handlebars.registerPartial('buttonToggleVisibility', `{{#> "${TEMPLATES.COMPONENT_TOGGLE_VISIBILITY}"}}{{> @partial-block }}{{/"${TEMPLATES.COMPONENT_TOGGLE_VISIBILITY}"}}`);
Handlebars.registerPartial('buttonTakeItem', `{{#> "${TEMPLATES.COMPONENT_BUTTON_TAKE_ITEM}"}}{{/"${TEMPLATES.COMPONENT_BUTTON_TAKE_ITEM}"}}`);

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

// Hooks.once("ready", async function() {
// 
// });

// Hooks.on("createActor", async function(document, options, userId) {
//   console.log("created!");
// });

// Hooks.on("deleteActor", async function(document, options, userId) {
//   console.log("deleted!");
// });

Hooks.on("renderChatMessage", async function(message, html, data) {
  const isEditable = data.author.isGM;
  const isOwner = data.author.isOwner;
  ListenerUtil.activateListeners(html, undefined, isOwner, isEditable);
});