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
 * @property {InjuryState} patchedUp
 * @property {InjuryState} treated
 * @property {InjuryState} permanent
 * 
 * @constant
 */
export const INJURY_STATES = {
  active: new InjuryState({
    name: "active",
    localizableName: "ambersteel.character.health.injury.state.active.label",
    icon: "fas fa-bone"
  }),
  patchedUp: new InjuryState({
    name: "patchedUp",
    localizableName: "ambersteel.character.health.injury.state.patchedUp.label",
    icon: "fas fa-band-aid"
  }),
  treated: new InjuryState({
    name: "treated",
    localizableName: "ambersteel.character.health.injury.state.treated.label",
    icon: "fas fa-mortar-pestle"
  }),
  permanent: new InjuryState({
    name: "permanent",
    localizableName: "ambersteel.character.health.injury.state.permanent.label",
    icon: "fas fa-crutch"
  })
};