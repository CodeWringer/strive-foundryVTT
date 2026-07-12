/**
 * Represents a plain axis-aligned rectangle. 
 * 
 * @property {Number} top
 * @property {Number} left
 * @property {Number} right
 * * read-only
 * @property {Number} bottom
 * * read-only
 * @property {Number} width
 * @property {Number} height
 */
export class Rect {
  get bottom() { return this.top + this.height; }

  get right() { return this.left + this.width; }

  /**
   * @param {Object} args 
   * @param {Number} args.x 
   * @param {Number} args.y 
   * @param {Number} args.width 
   * @param {Number} args.height 
   */
  constructor(args = {}) {
    this.left = args.x;
    this.top = args.y;
    this.width = args.width;
    this.height = args.height;
  }
}
