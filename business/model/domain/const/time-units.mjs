/**
 * Represents a time unit. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class TimeUnit {
  /**
   * @param {Object} args 
   * @param {String} args.name 
   * @param {String} args.localizableName 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents all system-defined time units. 
 * 
 * @property {TimeUnit} none A placeholder/undefined attack type. 
 * @property {TimeUnit} second
 * @property {TimeUnit} minute
 * @property {TimeUnit} hour
 * @property {TimeUnit} day
 * 
 * @constant
 */
export const TIME_UNITS = {
  none: new TimeUnit({
    name: "none",
    localizableName: "system.general.timeUnit.none",
  }),
  second: new TimeUnit({
    name: "second",
    localizableName: "system.general.timeUnit.second",
  }),
  minute: new TimeUnit({
    name: "minute",
    localizableName: "system.general.timeUnit.minute",
  }),
  hour: new TimeUnit({
    name: "hour",
    localizableName: "system.general.timeUnit.hour",
  }),
  day: new TimeUnit({
    name: "day",
    localizableName: "system.general.timeUnit.day",
  }),
};
