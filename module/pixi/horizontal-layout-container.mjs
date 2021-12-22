import LayoutContainer from "./layout-container.mjs";

/**
 * Aligns children as a horizontal list. 
 * 
 * Child height will be stretched to match the container's height.
 */
export default class HorizontalLayoutContainer extends LayoutContainer {
  constructor(pixiApp) {
    super(pixiApp);
  }
  
  refreshLayout() {
    let numberOfFillChildren = 0;
    let childrenSummedWidth = 0;
    for (const child of this.children) {
      if (child.fill === true) {
        numberOfFillChildren++;
      } else {
        childrenSummedWidth += child.width;
      }
    }
    const fillChildrenWidth = Math.max(0, (this.width - childrenSummedWidth) / numberOfFillChildren);

    let x = 0;
    for (const child of this.children) {
      child.x = x;
      child.height = this.height;

      if (child.fill === true) {
        child.width = fillChildrenWidth;
        x += fillChildrenWidth;
      } else {
        x += child.width;
      }

      if (child.refreshLayout !== undefined) {
        child.refreshLayout();
      }
    }
  }
}