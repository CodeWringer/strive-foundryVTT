import LayoutContainer from "./layout-container.mjs";
import { getProportionalMaxSize } from "./pixi-utility.mjs";

/**
 * Aligns children by centering them on itself. Does not adjust child sizes, 
 * unless they're set to fill. 
 * 
 * IMPORTANT NOTE: Expects to only ever have ONE CHILD at a time. Multiple children will 
 * ALL be centered and thus overlap!
 */
export default class CenterLayoutContainer extends LayoutContainer {
  /**
   * @private
   */
  _padding = { x: 0, y: 0 };
  get padding() { return this._padding; }
  set padding(value) {
    this._padding = value;
    this.refreshLayout();
  }

  get contentRectangle() {
    return new PIXI.Rectangle(
      this.padding.x,
      this.padding.y,
      this.width - (this.padding.x * 2),
      this.height - (this.padding.y * 2)
    )
  }

  constructor(paddingX = 0, paddingY = 0) {
    super();

    this.padding = { x: paddingX, y: paddingY };
  }

  refreshLayout() {
    const contentRectangle = this.contentRectangle;

    for (const child of this.children) {
      if (child.fill === true) {
        child.x = contentRectangle.x;
        child.y = contentRectangle.y;
        child.width = contentRectangle.width;
        child.height = contentRectangle.height;
      } else {
        const childDimensions = { width: child.width, height: child.height };
        if (child.wrapped !== undefined) {
          if (child.wrapped.texture !== undefined) {
            childDimensions.width = child.wrapped.texture.width;
            childDimensions.height = child.wrapped.texture.height;
          }
        }

        const dimensions = getProportionalMaxSize(
          childDimensions.width, 
          childDimensions.height, 
          contentRectangle.width, 
          contentRectangle.height
        );
        child.width = dimensions.width;
        child.height = dimensions.height;

        // Set local position of the child. This centers the child. 
        // Setting the local position of the child must happen after updating its dimensions, 
        // otherwise outdated dimensions would be used. 
        child.x = contentRectangle.x + (contentRectangle.width / 2) - (child.width / 2);
        child.y = contentRectangle.y + (contentRectangle.height / 2) - (child.height / 2);
      }

      if (child.refreshLayout !== undefined) {
        child.refreshLayout();
      }
    }
  }
}