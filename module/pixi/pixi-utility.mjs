/**
 * @param {Number} width 
 * @param {Number} height 
 * @param {Number} maxWidth 
 * @param {Number} maxHeight 
 * @returns {Object} { w: {Number}, h: {Number} }
 */
export function getProportionalMaxSize(width, height, maxWidth, maxHeight) {
  const deltaW = maxWidth - width;
  const deltaH = maxHeight - height;

  let ratio = 0.0;
  if (deltaW < deltaH) {
    ratio = maxWidth / width;
  } else {
    ratio = maxHeight / height;
  }

  return { width: width * ratio, height: height * ratio };
}