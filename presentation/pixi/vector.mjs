export class Vector2D {
  x = 0;
  y = 0;

  /**
   * Returns the magnitude (length) of this {Vector2D}. 
   * @returns {Number} The magnitude (length) of this {Vector2D}. 
   */
  get magnitude() { return this.getMagnitude(); }

  /**
   * Returns a normalized (= unit) {Vector2D}, based on this {Vector2D}. 
   * @returns {Vector2D} A normalized {Vector2D}. 
   */
  get normalized() { return this.getNormalized(); }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns the magnitude (length) of this {Vector2D}. 
   * @returns {Number} The magnitude (length) of this {Vector2D}. 
   */
  getMagnitude() {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
  }

  /**
   * Returns a normalized (= unit) {Vector2D}, based on this {Vector2D}. 
   * @returns {Vector2D} A normalized {Vector2D}. 
   */
  getNormalized() {
    const magnitude = this.magnitude;
    if (magnitude === 0) {
      return new Vector2D();
    } else {
      return new Vector2D(this.x / magnitude, this.y / magnitude);
    }
  }

  /**
   * Adds another {Vector2D} to this one. 
   * @param {Vector2D} other Another {Vector2D} to add to this one. 
   * @returns {Vector2D} This {Vector2D}, to enable chaining. 
   */
  add(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }
  
  /**
   * Subtracts another {Vector2D} from this one. 
   * @param {Vector2D} other Another {Vector2D} to subtract from this one. 
   * @returns {Vector2D} This {Vector2D}, to enable chaining. 
   */
  subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  /**
   * Multiplies this {Vector2D} with the given number. 
   * @param {Number} value A number to multiply with. 
   * @returns {Vector2D} This {Vector2D}, to enable chaining. 
   */
  multiply(value) {
    this.x = this.x * value;
    this.y = this.y * value;
    return this;
  }
  
  /**
   * Divides this {Vector2D} by the given number. 
   * @param {Number} value A number to divide by. 
   * @returns {Vector2D} This {Vector2D}, to enable chaining. 
   */
  divide(value) {
    this.x = this.x / value;
    this.y = this.y / value;
    return this;
  }

  /**
   * Returns a clone of this {Vector2D}. 
   * @returns {Vector2D} A clone of this {Vector2D}. 
   */
  clone() {
    return new Vector2D(this.x, this.y);
  }
}
