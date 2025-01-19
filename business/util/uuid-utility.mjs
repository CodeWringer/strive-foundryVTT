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

  /**
   * Returns a sanitized version of the given ID. Sanitizes by stripping out invalid characters. 
   * 
   * @param {String} id 
   * 
   * @returns {String}
   */
  sanitizeId(id) {
    const rgxUnacceptedChars = new RegExp("[^a-zA-z0-9-]", "g");
    try {
      const matches = id.match(rgxUnacceptedChars);
      let sanitized = id;
  
      if (matches === null) return sanitized;
  
      for (const match of matches) {
        const index = sanitized.indexOf(match);
        sanitized = sanitized.substring(0, index) + sanitized.substring(index + 1);
      }
      return sanitized;
    } catch (error) {
      game.strive.logger.logError("Failed to sanitize the following ID");
      game.strive.logger.logError(id);
      game.strive.logger.logError(error);
      return UuidUtil.createUUID();
    }
  },
}
