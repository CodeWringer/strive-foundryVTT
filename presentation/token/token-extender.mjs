/**
 * Adds additional elements to a token. 
 * 
 * @see https://foundryvtt.com/api/classes/client.Token.html
 */
export default class TokenExtender {
  /**
   * Returns the scale factor of a given token. 
   * 
   * @param {Token} token 
   * 
   * @returns {Number}
   */
  getScale(token) {
    return token.h / 100.0; // Baseline from 100px. If the canvas size changes, this number changes. 
  }

  /**
   * Invoked when the cursor hovers over the token. 
   * 
   * @param {Token} token 
   */
  hoverOn(token) {
    // Implementation up to inheritors. 
  }

  /**
   * Invoked when the cursor leaves the token. 
   * 
   * @param {Token} token 
   */
  hoverOff(token) {
    // Implementation up to inheritors. 
  }

  /**
   * Updates the additional elements on the token, by adding, updating or removing them. 
   * 
   * @param {Token} token 
   * 
   * @static
   */
  async updateOn(token) {
    // Implementation up to inheritors. 
  }
}
