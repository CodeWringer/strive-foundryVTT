import { ValidationUtil } from "../../../../business/util/validation-utility.mjs";

/**
 * Represents the definition of a component. 
 * 
 * @property {String} template
 * @property {ViewModel} viewModel
 * @property {String} cssClass
 * @property {Boolean} isHidden
 */
export class TemplatedComponent {
  /**
   * @param {Object} args 
   * @param {String} args.template 
   * @param {ViewModel} args.viewModel 
   * @param {String | undefined} args.cssClass 
   * * default `""`
   * @param {Boolean | undefined} args.isHidden 
   * * default `false`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["template", "viewModel"]);

    this.template = args.template;
    this.viewModel = args.viewModel;

    this.cssClass = args.cssClass ?? "";
    this.isHidden = args.isHidden ?? false;
  }
}
