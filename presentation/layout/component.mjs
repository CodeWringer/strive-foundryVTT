import { validateOrThrow } from "../../business/util/validation-utility.mjs";
import Layoutable from "./layoutable.mjs";

/**
 * Wraps a component for use as a `Layoutable`. 
 * 
 * @extends Layoutable
 */
export default class Component extends Layoutable {
  /**
   * @param {Object} args 
   * 
   * @param {String} args.template Template path. 
   * @param {LayoutSize | undefined} args.layoutSize This element's 
   * preferred size in its parent layout. 
   * @param {String | undefined} args.cssClass A css class.  
   * 
   * @param {Function} args.viewModelFunc Must return a new view 
   * model instance. Receives the following arguments: 
   * * `parent: {ViewModel}` - Is a parent view model instance. 
   * This is expected to be the root view model instance of a 
   * dedicated sheet, list item or chat message. 
   * * `isEditable: {Boolean}` - Is `true`, the button is interactible. 
   * * `isGM: {Boolean}` - Is `true`, if the current user is a GM. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["viewModelFunc"]);

    this.viewModelFunc = args.viewModelFunc;
  }

  /** @override */
  getViewModel(parent) {
    return this.viewModelFunc(parent, parent.isEditable, parent.isGM);
  }
}