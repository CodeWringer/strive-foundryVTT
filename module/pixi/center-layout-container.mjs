import LayoutContainer from "./layout-container.mjs";

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

  constructor(paddingX, paddingY) {
    super();
    
    this.padding = { x: paddingX, y: paddingY };
  }

  refreshLayout() {
    for (const child of this.children) {
      if (child.fill === true) {
        child.x = this.padding.x;
        child.y = this.padding.y;
        child.width = this.width - (this.padding.x * 2);
        child.height = this.height - (this.padding.y * 2);
      } else {
        child.x = (this.width / 2) - (child.width / 2);
        child.y = (this.height / 2) - (child.height / 2);
      }
    }
  }
}