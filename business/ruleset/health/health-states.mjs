import * as ConstantsUtils from "../../util/constants-utility.mjs";
import { validateOrThrow } from "../../util/validation-utility.mjs";

/**
 * Represents a general health state. 
 * 
 * @property {String} name Internal name. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {String | undefined} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 * @property {Number} limit A limit on how many times this health state may be incurred. 
 * * `0` implies there is no limit. 
 * * Minimum is `0`.
 */
export class HealthState {
  /**
   * @private
   */
  _limit = 0;
  get limit() { return this._limit; }
  set limit(value) {
    this._limit = Math.max(value, 0);
  }

  /**
   * @param {Object} args
   * @param {String} args.name Internal name. 
   * @param {String | undefined} args.localizableName Localization key. 
   * @param {String | undefined} args.icon CSS class of an icon. 
   * * E. g. `"fas fa-virus"`
   * @param {Number | undefined} args.limit A limit on how many times this health state may be incurred. 
   * * `0` implies there is no limit. 
   * * Default `0`.
   * * Negative values are clamped to `0`.
   */
  constructor(args = {}) {
    validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
    this._limit = args.limit ?? 0;
  }
}

/**
 * Represents the defined general health states.
 * 
 * @property {HealthState} berserk 
 * @property {HealthState} burning 
 * @property {HealthState} bleeding 
 * @property {HealthState} deathsDoor 
 * @property {HealthState} dissolving 
 * @property {HealthState} drugAddicted 
 * @property {HealthState} electrified 
 * @property {HealthState} exhausted 
 * @property {HealthState} frostbitten 
 * @property {HealthState} grappled 
 * @property {HealthState} hasted 
 * @property {HealthState} jealous 
 * @property {HealthState} pacified 
 * @property {HealthState} poisoned 
 * @property {HealthState} prone 
 * @property {HealthState} rooted 
 * @property {HealthState} stunned
 * @property {HealthState} terrified 
 * @property {HealthState} unconscious 
 * 
 * @constant
 */
export const HEALTH_STATES = {
  berserk: new HealthState({
    name: "berserk",
    localizableName: "system.character.health.states.berserk",
    limit: 0,
  }),
  burning: new HealthState({
    name: "burning",
    localizableName: "system.character.health.states.burning",
    limit: 0,
  }),
  bleeding: new HealthState({
    name: "bleeding",
    localizableName: "system.character.health.states.bleeding",
    limit: 0,
  }),
  deathsDoor: new HealthState({
    name: "deathsDoor",
    localizableName: "system.character.health.states.death",
    limit: 1,
  }),
  dissolving: new HealthState({
    name: "dissolving",
    localizableName: "system.character.health.states.dissolving",
    limit: 0,
  }),
  drugAddicted: new HealthState({
    name: "drugAddicted",
    localizableName: "system.character.health.states.drugAddicted",
    limit: 1,
  }),
  electrified: new HealthState({
    name: "electrified",
    localizableName: "system.character.health.states.electrified",
    limit: 0,
  }),
  exhausted: new HealthState({
    name: "exhausted",
    localizableName: "system.character.health.states.exhausted",
    limit: 1,
  }),
  frostbitten: new HealthState({
    name: "frostbitten",
    localizableName: "system.character.health.states.frostbitten",
    limit: 0,
  }),
  grappled: new HealthState({
    name: "grappled",
    localizableName: "system.character.health.states.grappled",
    limit: 1,
  }),
  hasted: new HealthState({
    name: "hasted",
    localizableName: "system.character.health.states.hasted",
    limit: 1,
  }),
  jealous: new HealthState({
    name: "jealous",
    localizableName: "system.character.health.states.jealous",
    limit: 0,
  }),
  pacified: new HealthState({
    name: "pacified",
    localizableName: "system.character.health.states.pacified",
    limit: 0,
  }),
  poisoned: new HealthState({
    name: "poisoned",
    localizableName: "system.character.health.states.poisoned",
    limit: 0,
  }),
  prone: new HealthState({
    name: "prone",
    localizableName: "system.character.health.states.prone",
    limit: 1,
  }),
  rooted: new HealthState({
    name: "rooted",
    localizableName: "system.character.health.states.rooted",
    limit: 1,
  }),
  stunned: new HealthState({
    name: "stunned",
    localizableName: "system.character.health.states.stunned",
    limit: 0,
  }),
  terrified: new HealthState({
    name: "terrified",
    localizableName: "system.character.health.states.terrified",
    limit: 0,
  }),
  unconscious: new HealthState({
    name: "unconscious",
    localizableName: "system.character.health.states.unconscious",
    limit: 1,
  }),
};
ConstantsUtils.enrichConstant(HEALTH_STATES);
