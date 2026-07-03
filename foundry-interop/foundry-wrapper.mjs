import { ValidationUtil } from "../common/util/validation-utility.mjs";

/**
 * Serves as an integration limiter to FoundryVTTs functions. 
 * 
 * This type wraps FoundryVTT functions used in the project, so that whenever the FoundryVTT API changes (which happens 
 * from time to time), only one place in the project has to be adjusted, accordingly. 
 */
export default class FoundryWrapper {
  // Class wraps.
  static ApplicationV2 = foundry.applications.api.ApplicationV2;

  /** @see https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html */
  static DocumentSheetV2 = foundry.applications.api.DocumentSheetV2;
  static ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;
  static ItemSheetV2 = foundry.applications.sheets.ItemSheetV2;
  static DialogV2 = foundry.applications.api.DialogV2;
  static HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;
  static CombatTracker = foundry.applications.sidebar.tabs.CombatTracker;
  static TokenHUD = foundry.applications.hud.TokenHUD;

  static deepClone = foundry.utils.deepClone;

  /**
   * 
   * @param {Object} args
   * @param {Collection} args.registry A foundry Actors or Items collection.
   * See `FoundryWrapper.collections.documents`
   * @param {String} args.type Must correspond to one of the Actor or Item declarations 
   * @param {DocumentSheetV2} args.sheet 
   * as found in the system.json `documentTypes.Actor` or `documentTypes.Item` fields. 
   * 
   * @example
   * ```Js
   * FoundryWrapper.registerSheet({
   *   registry: FoundryWrapper.collections.documents.actors,
   *   type: "plain",
   *   sheet: PlainActorSheet,
   * });
   * ```
   */
  static registerSheet(args = {}) {
    args.registry.registerSheet(`strive.${args.type}`, args.sheet, {
      types: [args.type],
      makeDefault: true,
    });
  }

  /**
   * @static
   * @constant
   * @type {Object}
   */
  static collections = {
    documents: {
      actors: foundry.documents.collections.Actors,
      items: foundry.documents.collections.Items,
    },
  }

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
   * Plays the given sound file once. 
   * 
   * @param {String} soundSrc An audio file url. 
   * See also `SOUNDS_CONSTANTS`. 
   * @param {Object} options 
   * @param {AudioContext} options.context 
   * @param {Boolean} options.forceBuffer  
   * 
   * @async
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
   * @returns {Promise<String>} The rendered HTML. 
   * 
   * @async
   */
  async renderTemplate(templatePath, args = {}) {
    return await foundry.applications.handlebars.renderTemplate(templatePath, args);
  }

  /**
   * Preloads the given array of relative Handlebars templates. 
   * 
   * @param {Array<String>} templateArray 
   * @returns {Promise<Any>}
   * 
   * @static
   * @async
   */
  static async loadTemplates(templateArray) {
    return await foundry.applications.handlebars.loadTemplates(templateArray);
  }

  /**
   * Creates a new instance of a FoundryVTT ContextMenu and returns it. 
   * 
   * @param {JQuery} html 
   * @param {String} id 
   * @param {Array<ContextMenuItem>} items 
   * 
   * @returns {ContextMenu}
   */
  createContextMenu(html, id, items) {
    return new ContextMenu(html, id, items);
  }

  /**
   * Calls the specified FoundryVTT Hook, with optional arguments. 
   * @param {String} hook Hook name to call. 
   * @static
   */
  static callHook(hook) {
    Hooks.call(hook, arguments);
  }
}
