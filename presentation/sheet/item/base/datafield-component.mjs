import { TemplatedComponent } from "./templated-component.mjs";

/**
 * Represents the definition of a data field component. 
 * 
 * @property {String} template
 * @property {ViewModel} viewModel
 * @property {String} cssClass
 * @property {Boolean} isHidden
 * @property {String | undefined} localizedIconToolTip
 * @property {String | undefined} localizedLabel
 * @property {String | undefined} iconClass
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
   * @param {String | undefined} args.localizedIconToolTip 
   * @param {String | undefined} args.localizedLabel 
   * @param {String | undefined} args.iconClass 
   */
  constructor(args = {}) {
    super(args);

    this.localizedIconToolTip = args.localizedIconToolTip;
    this.localizedLabel = args.localizedLabel;
    this.iconClass = args.iconClass;
  }
}
