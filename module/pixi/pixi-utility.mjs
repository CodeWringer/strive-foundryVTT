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
 * @param {Number} width 
 * @param {Number} height 
 * @param {Number} maxWidth 
 * @param {Number} maxHeight 
 * @returns {Object} { w: {Number}, h: {Number} }
 */
export function getProportionalMaxSize(width, height, maxWidth, maxHeight) {
  const delta = { w: maxWidth - width, h: maxHeight - height };
  const deltaMin = Math.min(delta.w, delta.h);
  return { width: width + deltaMin, height: height + deltaMin };
}