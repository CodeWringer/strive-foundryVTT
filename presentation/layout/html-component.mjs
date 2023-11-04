import { validateOrThrow } from "../../business/util/validation-utility.mjs";
import Layoutable from "./layoutable.mjs";

/**
 * Wraps a some raw html for use as a `Layoutable`. 
 * 
 * @extends Layoutable
 * 
 * @property {String} html
 */
export default class HtmlComponent extends Layoutable {
  /**
   * @param {Object} args 
   * 
   * @param {LayoutSize | undefined} args.layoutSize This element's 
   * preferred size in its parent layout. 
   * @param {String | undefined} args.cssClass A css class.  
   * 
   * @param {String} args.html
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["html"]);

    this.html = args.html;
  }
}
