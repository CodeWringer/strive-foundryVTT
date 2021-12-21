import LayoutContainer from "./layout-container.mjs";

/**
 * Aligns children as a vertical list. 
 * 
 * Child width will be stretched to match the container's width.
 */
export default class VerticalLayoutContainer extends LayoutContainer {
  refreshLayout() {
    const fillChildren = [];

    const children = [];
    let childrenSummedHeight = 0;
    
    for (const child of this.children) {
      if (child.fill === true) {
        fillChildren.push(child);
      } else {
        children.push(child);
        childrenSummedHeight += child.height;
      }
    }

    const fillChildrenHeight = Math.max(0, (this.height - childrenSummedHeight) / fillChildren.length);

    let y = 0;
    for (const child of this.children) {
      child.y = y;
      child.width = this.width;

      if (child.fill === true) {
        y += fillChildrenHeight;
        child.height = fillChildrenHeight;
      } else {
        y += child.height;
      }
    }
  }
}