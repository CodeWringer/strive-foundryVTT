/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/ambersteel/templates/actor/parts/actor-personals.hbs",
    "systems/ambersteel/templates/actor/parts/actor-basics.hbs",
    "systems/ambersteel/templates/actor/parts/actor-beliefs.hbs",
    "systems/ambersteel/templates/actor/parts/actor-fate.hbs",
    "systems/ambersteel/templates/actor/parts/actor-health.hbs",
    "systems/ambersteel/templates/actor/parts/actor-possessions.hbs",
    "systems/ambersteel/templates/actor/parts/actor-biography.hbs",
  ]);
};
