/**
 * Centers the given PIXI.DisplayObject on the given bounds rectangle. 
 * @param {PIXI.DisplayObject} displayObject A Sprite to center. 
 * @param {Rectangle} rectangle A rectangle that represents the bounds to center on. 
 * @param {Boolean} isRelative If true, will return a relative offset to the rectangle. 
 */
export function centerOn(displayObject, rectangle, isRelative = false) {
  centerOnX(displayObject, rectangle, isRelative);
  centerOnY(displayObject, rectangle, isRelative);
}

/**
 * Horizontally centers the given PIXI.DisplayObject on the given bounds rectangle. 
 * @param {PIXI.DisplayObject} displayObject A Sprite to center. 
 * @param {Rectangle} rectangle A rectangle that represents the bounds to center on. 
 * @param {Boolean} isRelative If true, will return a relative offset to the rectangle. 
 */
export function centerOnX(displayObject, rectangle, isRelative = false) {
  displayObject.x = (rectangle.width / 2) - (displayObject.width / 2);

  if (!isRelative) {
    displayObject.x = displayObject.x + rectangle.x;
  }
}

/**
 * Horizontally centers the given PIXI.DisplayObject on the given bounds rectangle. 
 * @param {PIXI.DisplayObject} displayObject A Sprite to center. 
 * @param {Rectangle} rectangle A rectangle that represents the bounds to center on. 
 * @param {Boolean} isRelative If true, will return a relative offset to the rectangle. 
 */
export function centerOnY(displayObject, rectangle, isRelative = false) {
  displayObject.y = (rectangle.height / 2) - (displayObject.height / 2);

  if (!isRelative) {
    displayObject.y = displayObject.y + rectangle.y;
  }
}

/**
 * @param {Number} w 
 * @param {Number} h 
 * @param {Number} maxW 
 * @param {Number} maxH 
 * @returns {Object} { w: {Number}, h: {Number} }
 */
export function getProportionalMaxSize(w, h, maxW, maxH) {
  const delta = { w: maxW - w, h: maxH - h };
  const deltaMin = Math.min(delta.w, delta.h);
  return { w: w + deltaMin, h: h + deltaMin };
}