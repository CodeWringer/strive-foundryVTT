import { getAsArray, getAsChoices } from "../../util/constants-utility.mjs";

/**
 * Represents a general health state. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String | undefined} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 */
export class HealthState {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * Represents the defined general health states.
 * 
 * @property {HealthState} berserk 
 * @property {HealthState} burning 
 * @property {HealthState} bleeding 
 * @property {HealthState} dazed 
 * @property {HealthState} death 
 * @property {HealthState} dissolving 
 * @property {HealthState} electrified 
 * @property {HealthState} frostbitten 
 * @property {HealthState} grappled 
 * @property {HealthState} hasted 
 * @property {HealthState} jealous 
 * @property {HealthState} pacified 
 * @property {HealthState} poisoned 
 * @property {HealthState} prone 
 * @property {HealthState} rooted 
 * @property {HealthState} terrified 
 * @property {HealthState} unconscious 
 * 
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * @property {Array<HealthState>} asArray The constants of this type, as an array. 
 * 
 * @constant
 */
export const HEALTH_STATES = {
  berserk: new HealthState({
    name: "berserk",
    localizableName: "ambersteel.character.health.states.berserk",
  }),
  burning: new HealthState({
    name: "burning",
    localizableName: "ambersteel.character.health.states.burning",
  }),
  bleeding: new HealthState({
    name: "bleeding",
    localizableName: "ambersteel.character.health.states.bleeding",
  }),
  dazed: new HealthState({
    name: "dazed",
    localizableName: "ambersteel.character.health.states.dazed",
  }),
  death: new HealthState({
    name: "death",
    localizableName: "ambersteel.character.health.states.death",
  }),
  dissolving: new HealthState({
    name: "dissolving",
    localizableName: "ambersteel.character.health.states.dissolving",
  }),
  electrified: new HealthState({
    name: "electrified",
    localizableName: "ambersteel.character.health.states.electrified",
  }),
  frostbitten: new HealthState({
    name: "frostbitten",
    localizableName: "ambersteel.character.health.states.frostbitten",
  }),
  grappled: new HealthState({
    name: "grappled",
    localizableName: "ambersteel.character.health.states.grappled",
  }),
  hasted: new HealthState({
    name: "hasted",
    localizableName: "ambersteel.character.health.states.hasted",
  }),
  jealous: new HealthState({
    name: "jealous",
    localizableName: "ambersteel.character.health.states.jealous",
  }),
  pacified: new HealthState({
    name: "pacified",
    localizableName: "ambersteel.character.health.states.pacified",
  }),
  poisoned: new HealthState({
    name: "poisoned",
    localizableName: "ambersteel.character.health.states.poisoned",
  }),
  prone: new HealthState({
    name: "prone",
    localizableName: "ambersteel.character.health.states.prone",
  }),
  rooted: new HealthState({
    name: "rooted",
    localizableName: "ambersteel.character.health.states.rooted",
  }),
  terrified: new HealthState({
    name: "terrified",
    localizableName: "ambersteel.character.health.states.terrified",
  }),
  unconscious: new HealthState({
    name: "unconscious",
    localizableName: "ambersteel.character.health.states.unconscious",
  }),
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asChoices;
  },
  get asArray() {
    if (this._asArray === undefined) {
      this._asArray = getAsArray(this, ["asChoices", "_asChoices", "asArray", "_asArray"]);
    }
    return this._asArray;
  }
};
