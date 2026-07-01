/**
 * Represents an injury shrug off state. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 */
export class InjuryShrugOffState {
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
  }
}

/**
 * Represents the defined illness states.
 * 
 * @property {InjuryShrugOffState} indeterminate 
 * @property {InjuryShrugOffState} failed 
 * @property {InjuryShrugOffState} succeeded 
 * 
 * @constant
 */
export const INJURY_SHRUG_OFF_STATES = {
  indeterminate: new InjuryShrugOffState({
    name: "indeterminate",
    localizableName: "system.character.health.injury.shrugOff.indeterminate",
    icon: "fas fa-virus"
  }),
  failed: new InjuryShrugOffState({
    name: "failed",
    localizableName: "system.character.health.injury.shrugOff.failed",
    icon: "fas fa-virus"
  }),
  succeeded: new InjuryShrugOffState({
    name: "succeeded",
    localizableName: "system.character.health.injury.shrugOff.succeeded",
    icon: "fas fa-virus"
  }),
};
