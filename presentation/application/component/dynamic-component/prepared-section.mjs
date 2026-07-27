import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DynamicComponent from "./dynamic-component.mjs";

/**
 * @property {String | undefined} html 
 * @property {String | undefined} template Relative path identifying the template 
 * to use.
 * @property {ViewModel | undefined} viewModel
 * @property {String | undefined} cssClass A CSS class to pass to the 
 * template when rendered. 
 * * default `""`
 */
export default class PreparedSection {
  /**
   * Converts a `DynamicComponent` to an instance of this class. 
   * @param {DynamicComponent} dynamicComponent 
   * @param {ViewModel} parent
   * @returns {PreparedSection}
   * @static
   */
  static fromDynamicComponent(dynamicComponent, parent) {
    let viewModel;
    if (ValidationUtil.isDefined(dynamicComponent.viewModelFactory)) {
      viewModel = dynamicComponent.viewModelFactory(parent);
    }

    return new PreparedSection({
      html: dynamicComponent.html,
      template: dynamicComponent.template,
      viewModel: viewModel,
      cssClass: dynamicComponent.cssClass,
    });
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.html
   * @param {String | undefined} args.template Relative path identifying the template 
   * to use.
   * @param {ViewModel | undefined} args.viewModel
   * @param {String | undefined} args.cssClass A CSS class to pass to the 
   * template when rendered. 
   * * default `""`
   */
  constructor(args = {}) {
    this.html = args.html;
    this.template = args.template;
    this.viewModel = args.viewModel;
    this.cssClass = args.cssClass;
  }
}
