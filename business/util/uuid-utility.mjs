/**
 * @constant
 */
export const UuidUtil = {
  /**
   * The proper UUID format. 
   * @type {String}
   */
  properFormat: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',

  /**
   * A shortened UUID format. 
   * Technically, this isn't a UUID, at all. But it's still useful 
   * for when the proper format would be overkill. 
   * @type {String}
   */
  simpleFormat: 'xxxxxxxxxxxxxxxx',

  /**
   * Generates and returns a UUID. 
   * @param useProperFormat If true, uses the proper, long UUID format. 
   * @returns {String} A new UUID. 
   */
  createUUID: function (useProperFormat = false) {
    const format = useProperFormat ? this.properFormat : this.simpleFormat;
    let d = new Date().getTime(); // Timestamp
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return format.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16; // Random number between 0 and 16
      if (d > 0) { // Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else { // Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },
}
