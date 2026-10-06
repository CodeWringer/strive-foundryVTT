import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * For insertion into an application at run-time. 
 * 
 * @property {String | undefined} html Literal HTML string to insert. Takes precedence over `template`. 
 * @property {String | undefined} template Relative path identifying the template 
 * to use.
 * @property {Function<ViewModel> | undefined} viewModelFactory Must return a `ViewModel` 
 * instance for use in the `template`. 
 * @property {String} cssClass A CSS class to pass to the 
 * template when rendered. 
 */
export default class DynamicComponent {
  /**
   * @param {Object} args 
   * @param {String | undefined} args.html Literal HTML string to insert. Takes precedence over `template`. 
   * @param {String | undefined} args.template Relative path identifying the template 
   * to use.
   * @param {Function<ViewModel> | undefined} args.viewModelFactory Must return a `ViewModel` 
   * instance for use in the `template`. Arguments:
   * * `parent: ViewModel` - the factory function must assign this as the `parent`. 
   * @param {String | undefined} args.cssClass A CSS class to pass to the 
   * template when rendered. 
   * * default `""`
   */
  constructor(args = {}) {
    this.html = args.html;
    this.template = args.template;
    this.viewModelFactory = args.viewModelFactory;
    this.cssClass = args.cssClass ?? "";
  }

  /**
   * Renders the component and returns the rendered result. 
   * @param {ViewModel | undefined} parent A parent `ViewModel` instance to pass 
   * to the `viewModelFactory`.
   * @returns {Promise<Object>} properties:
   * * `rendered: String`
   * * `viewModel: ViewModel | undefined` - in case `viewModelFactory` is undefined. 
   * @async
   */
  async render(parent) {
    const viewModel = this.viewModelFactory(parent);
    let rendered;

    if (ValidationUtil.isDefined(this.html)) {
      rendered = this.html;
    } else {
      rendered = await FoundryWrapper.renderTemplate(this.template, {
        viewModel: viewModel,
        cssClass: this.cssClass,
      });
    }

    return {
      rendered: rendered,
      viewModel: viewModel,
    };
  }
}
