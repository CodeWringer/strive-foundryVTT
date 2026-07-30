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
 * @constant
 */
export const ILLNESS_STATES = {
  active: new IllnessState({
    name: "active",
    localizableName: "system.item.illness.state.active",
    icon: "ico ico-illness-state-active"
  }),
  treated: new IllnessState({
    name: "treated",
    localizableName: "system.item.illness.state.treated",
    icon: "ico ico-illness-state-treated"
  }),
};
