import { ConstantsUtil } from "../../util/constants-utility.mjs";

/**
 * Represents an injury state. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 */
export class InjuryState {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * Represents the defined injury states.
 * 
 * @property {InjuryState} active 
 * @property {InjuryState} treated
 * 
 * @constant
 */
export const INJURY_STATES = {
  active: new InjuryState({
    name: "active",
    localizableName: "system.character.health.injury.state.active.label",
    icon: "fas fa-bone"
  }),
  treated: new InjuryState({
    name: "treated",
    localizableName: "system.character.health.injury.state.treated.label",
    icon: "fas fa-mortar-pestle"
  }),
};
ConstantsUtil.enrichConstant(INJURY_STATES);
