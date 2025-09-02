import ViewModel from "../../../view-model/view-model.mjs";
import { TemplatedComponent } from "./templated-component.mjs";

/**
 * Represents the definition of a data field component. 
 * 
 * @property {String} template
 * @property {ViewModel} viewModel
 * @property {String} cssClass
 * @property {Boolean} isHidden
 * @property {String | undefined} localizedToolTip
 * @property {String | undefined} localizedLabel
 * @property {String | undefined} iconClass
 * @property {ViewModel} wrapViewModel An internal view model instance required 
 * to get the tool tip to display over icon, label and child view model. 
 * * read-only
 */
export class DataFieldComponent extends TemplatedComponent {
  /**
   * @param {Object} args 
   * @param {String} args.template 
   * @param {ViewModel} args.viewModel 
   * @param {String | undefined} args.cssClass 
   * * default `""`
   * @param {Boolean | undefined} args.isHidden 
   * * default `false`
   * @param {String | undefined} args.localizedToolTip 
   * @param {String | undefined} args.localizedLabel 
   * @param {String | undefined} args.iconClass 
   */
  constructor(args = {}) {
    super(args);

    this.localizedToolTip = args.localizedToolTip;
    this.localizedLabel = args.localizedLabel;
    this.iconClass = args.iconClass;

    this.wrapViewModel = new ViewModel({
      id: "wrapViewModel",
      parent: args.viewModel,
      localizedToolTip: args.localizedToolTip,
    });
  }
}
