import { ValidationUtil } from "../business/util/validation-utility.mjs";

/**
 * Serves as an integration limiter to FoundryVTTs functions. 
 * 
 * This type wraps FoundryVTT functions used in the project, so that whenever the FoundryVTT API changes (which happens 
 * from time to time), only one place in the project has to be adjusted, accordingly. 
 */
export default class FoundryWrapper {
  /**
   * Merges `defaultOptions` with `overrides`. Properties with the same name found in `overrides` 
   * take precedence. 
   * 
   * @param {Object} defaultOptions 
   * @param {Object} overrides 
   * @returns {Object}
   */
  mergeObject(defaultOptions, overrides) {
    if (ValidationUtil.isDefined(foundry) && ValidationUtil.isDefined(foundry.utils) && ValidationUtil.isDefined(foundry.utils.mergeObject)) { // Foundry 12
      return foundry.utils.mergeObject(defaultOptions, overrides);
    } else { // Foundry 11
      return mergeObject(defaultOptions, overrides);
    }
  }
  
  /**
   * Uses Foundry's dice roller to roll `number` of dice with `faces` faces and returns 
   * the rolled face results. 
   * 
   * @param {Number} faces The number of faces on a die. 
   * @param {Number} number The number of dice to roll. 
   * 
   * @returns {Array<Number>} The rolled faces. 
   * 
   * @async
   */
  async getEvaluatedDice(faces, number) {
    if (ValidationUtil.isDefined(foundry) && ValidationUtil.isDefined(foundry.dice) && ValidationUtil.isDefined(foundry.dice.terms) && ValidationUtil.isDefined(foundry.dice.terms.Die)) { // Foundry 12
      const rolledDice = await new foundry.dice.terms.Die({ faces: faces, number: number }).evaluate();

      return (rolledDice.values ?? rolledDice.results.map(it => it.result));
    } else { // Foundry 11
      const rolledDice = await new Die({ faces: faces, number: number }).evaluate();

      return rolledDice.results.map(it => it.result);
    }
  }

  /**
   * 
   * @param {String} soundSrc An audio file url. 
   * See also `SOUNDS_CONSTANTS`. 
   * @param {Object} options 
   * @param {AudioContext} options.context 
   * @param {Boolean} options.forceBuffer  
   * 
   * @see https://foundryvtt.com/api/v12/classes/foundry.audio.Sound.html#constructor
   */
  async playSound(soundSrc, options) {
    await new foundry.audio.Sound(soundSrc, options)
      .load({
        autoplay: true,
      });
  }

  /**
   * Renders and returns a template identified by the given path. 
   * 
   * @param {String} templatePath Full path to the template to render. 
   * @param {Object | undefined} args Optional arguments to pass to the template while 
   * it is being rendered. 
   * 
   * @returns {String} The rendered HTML. 
   */
  async renderTemplate(templatePath, args = {}) {
    return await renderTemplate(templatePath, args);
  }
}
