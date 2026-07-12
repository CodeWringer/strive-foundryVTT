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
