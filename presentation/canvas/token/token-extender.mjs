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
    return token.scene.dimensions.size / 100.0; // Baseline from 100px. If the canvas size changes, this number changes. 
  }

  /**
   * Invoked when the cursor hovers over the token. 
   * 
   * @param {Token} token 
   * 
   * @async
   */
  async hoverOn(token) {
    // Implementation up to inheritors. 
  }

  /**
   * Invoked when the cursor leaves the token. 
   * 
   * @param {Token} token 
   * 
   * @async
   */
  async hoverOff(token) {
    // Implementation up to inheritors. 
  }

  /**
   * Updates the additional elements on the token, by adding, updating or removing them. 
   * 
   * @param {Token} token 
   * 
   * @async
   */
  async updateOn(token) {
    // Implementation up to inheritors. 
  }
}
