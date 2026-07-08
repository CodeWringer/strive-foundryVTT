/**
 * For insertion into an application at run-time. 
 * 
 * @property {String | undefined} html 
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
   * @param {String | undefined} args.html
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
}
