/**
 * Transforms values bidirectionally. 
 * 
 * Useful for transforming data before it is sent for persisting on 
 * the server or after it was fetched from the server. 
 * 
 * @method from
 * @method to
 */
export default class ValueAdapter {
  /**
   * @param {Object} args 
   * @param {Function | undefined} args.from 
   * @param {Function | undefined} args.to 
   */
  constructor(args = {}) {
    this.from = args.from ?? ((value) => { return value; });
    this.to = args.to ?? ((value) => { return value; });
  }
}
