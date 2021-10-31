/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    // Components.
    "systems/ambersteel/templates/actor/components/component-attribute-table.hbs",
    "systems/ambersteel/templates/actor/components/component-skill-table.hbs",
    "systems/ambersteel/templates/actor/components/number-spinner.hbs",
    // Actor partials.
    "systems/ambersteel/templates/actor/parts/actor-personals.hbs",
    "systems/ambersteel/templates/actor/parts/actor-attributes.hbs",
    "systems/ambersteel/templates/actor/parts/actor-skills.hbs",
    "systems/ambersteel/templates/actor/parts/actor-beliefs.hbs",
    "systems/ambersteel/templates/actor/parts/actor-fate.hbs",
    "systems/ambersteel/templates/actor/parts/actor-health.hbs",
    "systems/ambersteel/templates/actor/parts/actor-possessions.hbs",
    "systems/ambersteel/templates/actor/parts/actor-biography.hbs",
    // Dice.
    "systems/ambersteel/templates/dice/roll.hbs",
    "systems/ambersteel/templates/dice/roll-dialog.hbs",
    // Sheets.
    "systems/ambersteel/templates/actor/actor-character-sheet.hbs",
    "systems/ambersteel/templates/item/item-item-sheet.hbs",
    "systems/ambersteel/templates/item/skill-item-sheet.hbs",
  ]);
};
