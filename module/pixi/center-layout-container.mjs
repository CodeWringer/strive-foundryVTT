import LayoutContainer from "./layout-container.mjs";
import { getProportionalMaxSize } from "./pixi-utility.mjs";

/**
 * Aligns children by centering them on itself. Does not adjust child sizes, 
 * unless they're set to fill. 
 * 
 * Children will always be stretched to fit the interior bounds, 
 * but while preserving their proportions. 
 */
export default class CenterLayoutContainer extends LayoutContainer {
  constructor(pixiApp) {
    super(pixiApp);
  }

  refreshLayout() {
    for (const child of this.children) {
      if (child.fill === true) {
        if (child.wrapped.anchor === undefined) {
          child.x = child.width;
          child.y = child.height;
        } else {
          child.x = child.width * child.wrapped.anchor.x;
          child.y = child.height * child.wrapped.anchor.y;
        }
        child.width = this.width;
        child.height = this.height;
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
          this.width, 
          this.height
        );
        child.width = dimensions.width;
        child.height = dimensions.height;

        // Set local position of the child. This centers the child. 
        // Setting the local position of the child must happen after updating its dimensions, 
        // otherwise outdated dimensions would be used. 
        if (child.wrapped.anchor === undefined) {
          child.x = (this.width / 2) - (child.width / 2);
          child.y = (this.height / 2) - (child.height / 2);
        } else {
          child.x = (this.width / 2) - (child.width / 2) + (child.width * child.wrapped.anchor.x);
          child.y = (this.height / 2) - (child.height / 2) + (child.height * child.wrapped.anchor.y);
        }
      }

      if (child.refreshLayout !== undefined) {
        child.refreshLayout();
      }
    }
  }
}