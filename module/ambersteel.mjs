// Import main config.
import { ambersteel } from "./config.js"
// Import document classes.
import { AmbersteelActor } from "./documents/actor.mjs";
import { AmbersteelItem } from "./documents/item.mjs";
// Import sheet classes.
import { AmbersteelActorSheet } from "./sheets/actor-sheet.mjs";
import { AmbersteelItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./templatePreloader.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {
  // Add config and constants to global namespace. 
  CONFIG.ambersteel = ambersteel;

  // Add system specific logic to global namespace. 
  game.ambersteel = {
    AmbersteelActor,
    AmbersteelItem,
    /**
     * Returns the number of dice for a skill test. 
     * @param {Number} skillValue A skill level. 
     * @param {Number} relatedAttributeValue Level of the skill related attribute. 
     * @returns {Number} The number of D6 available for the test. 
     */
    getSkillTestNumberOfDice: function(skillLevel, relatedAttributeLevel) {
      return skillLevel == 0 ? parseInt(Math.ceil(relatedAttributeLevel / 2)) : parseInt(Math.floor(relatedAttributeLevel / 2)) + skillLevel;
    }
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

Handlebars.registerHelper('log', function(js, content) {
  console.log(js);
  return "";
});

Handlebars.registerHelper('eq', function(a, b) {
  return a == b;
});

/* -------------------------------------------- */
/*  Handlebars Partials                         */
/* -------------------------------------------- */

Handlebars.registerPartial('numberSpinner', `{{#> "systems/ambersteel/templates/components/number-spinner.hbs"}}{{> @partial-block }}{{/"systems/ambersteel/templates/components/number-spinner.hbs"}}`);
Handlebars.registerPartial('buttonSendToChat', `{{#> "systems/ambersteel/templates/components/button-send-to-chat.hbs"}}{{/"systems/ambersteel/templates/components/button-send-to-chat.hbs"}}`);
Handlebars.registerPartial('buttonDelete', `{{#> "systems/ambersteel/templates/components/button-delete.hbs"}}{{/"systems/ambersteel/templates/components/button-delete.hbs"}}`);
Handlebars.registerPartial('buttonRoll', `{{#> "systems/ambersteel/templates/components/button-roll.hbs"}}{{/"systems/ambersteel/templates/components/button-roll.hbs"}}`);
Handlebars.registerPartial('buttonToggleSkillAbilityList', `{{#> "systems/ambersteel/templates/components/button-toggle-skill-ability-list.hbs"}}{{/"systems/ambersteel/templates/components/button-toggle-skill-ability-list.hbs"}}`);

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