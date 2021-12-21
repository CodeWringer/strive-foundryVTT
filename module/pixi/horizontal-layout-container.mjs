import LayoutContainer from "./layout-container.mjs";

/**
 * Aligns children as a horizontal list. 
 * 
 * Child height will be stretched to match the container's height.
 */
export default class HorizontalLayoutContainer extends LayoutContainer {
  constructor() {
    super();
  }

  refreshLayout() {
    const fillChildren = [];

    const children = [];
    let childrenSummedWidth = 0;
    
    for (const child of this.children) {
      if (child.fill === true) {
        fillChildren.push(child);
      } else {
        children.push(child);
        childrenSummedWidth += child.width;
      }
    }

    const fillChildrenWidth = Math.max(0, (this.width - childrenSummedWidth) / fillChildren.length);

    let x = 0;
    for (const child of this.children) {
      child.x = x;
      child.height = this.height;

      if (child.fill === true) {
        x += fillChildrenWidth;
        child.width = fillChildrenWidth;
      } else {
        x += child.width;
      }
    }
  }
}