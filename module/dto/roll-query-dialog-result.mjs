/**
 * Represents the result of a roll data query dialog. 
 * @property {Number} obstacle The obstacel number to roll against. 
 * @property {Number} bonusDice The number of bonus dice to roll. 
 * @property {Boolean} confirmed If true, the dialog was closed with confirmation. 
 * @property {CONFIG.ambersteel.visibilityModes} visibilityMode Optional. The selected visibility mode. Default public. 
 */
export default class RollDataQueryDialogResult {
  constructor(args = {}) {
    args = {
      obstacle: 0,
      bonusDice: 0,
      confirmed: false,
      visibilityMode: CONFIG.ambersteel.visibilityModes.public,
      ...args
    };
    this.obstacle = args.obstacle;
    this.bonusDice = args.bonusDice;
    this.confirmed = args.confirmed;
    this.visibilityMode = args.visibilityMode;
  }
}