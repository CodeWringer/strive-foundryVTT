import { getAsChoices } from "../util/constants-utility.mjs";

/**
 * Represents an illness state. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 */
export class IllnessState {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * Represents the defined illness states.
 * 
 * @property {IllnessState} active 
 * @property {IllnessState} treated
 * 
 * @property {Array<ChoiceOption>} asChoices The constants of this type, as an array 
 * of `ChoiceOption`s. 
 * 
 * @constant
 */
export const ILLNESS_STATES = {
  active: new IllnessState({
    name: "active",
    localizableName: "ambersteel.character.health.illness.state.active.label",
    icon: "fas fa-virus"
  }),
  treated: new IllnessState({
    name: "treated",
    localizableName: "ambersteel.character.health.illness.state.treated.label",
    icon: "fas fa-mortar-pestle"
  }),
  get asChoices() {
    if (this._asChoices === undefined) {
      this._asChoices = getAsChoices(this, ["asChoices", "_asChoices"]);
    }
    return this._asChoices;
  },
};