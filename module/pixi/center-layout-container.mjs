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

  /**
   * @private
   */
  _proportionalFill = false;
  get proportionalFill() { return this._proportionalFill; }
  set proportionalFill(value) {
    this._proportionalFill = value;
    this.refreshLayout();
  }

  constructor(paddingX = 0, paddingY = 0) {
    super();

    this.padding = { x: paddingX, y: paddingY };
  }

  refreshLayout() {
    for (const child of this.children) {
      if (child.fill === true) {
        const maxDimensions = { width: this.width - (this.padding.x * 2), height: this.height - (this.padding.y * 2) };
        const dimensions = this.proportionalFill ? getProportionalMaxSize(child.width, child.height, maxDimensions.width, maxDimensions.height) : maxDimensions;

        child.x = this.padding.x;
        child.y = this.padding.y;
        child.width = dimensions.width;
        child.height = dimensions.height;
      } else {
        child.x = (this.width / 2) - (child.width / 2);
        child.y = (this.height / 2) - (child.height / 2);
      }
    }
  }
}