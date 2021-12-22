import LayoutContainer from "./layout-container.mjs";

/**
 * Aligns children as a vertical list. 
 * 
 * Child width will be stretched to match the container's width.
 */
export default class VerticalLayoutContainer extends LayoutContainer {
  constructor() {
    super();
  }

  refreshLayout() {
    let numberOfFillChildren = 0;
    let childrenSummedHeight = 0;
    for (const child of this.children) {
      if (child.fill === true) {
        numberOfFillChildren++;
      } else {
        childrenSummedHeight += child.height;
      }
    }
    const fillChildrenHeight = Math.max(0, (this.height - childrenSummedHeight) / numberOfFillChildren);

    let y = 0;
    for (const child of this.children) {
      child.y = y;
      child.width = this.width;

      if (child.fill === true) {
        child.height = fillChildrenHeight;
        y += fillChildrenHeight;
      } else {
        y += child.height;
      }

      if (child.refreshLayout !== undefined) {
        child.refreshLayout();
      }
    }
  }
}