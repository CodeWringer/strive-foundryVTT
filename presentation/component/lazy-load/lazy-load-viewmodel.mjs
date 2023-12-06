import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * Wraps a **single** template and its corresponding view model and only loads them 
 * when manually triggered to do so. 
 * 
 * When updating, serves only as a proxy and will pass the given update arguments 
 * through to the wrapped view model instance. 
 * 
 * The properties `isEditable`, `isSendable` and `isOwner` are irrelevant to this 
 * component. As a proxy, it will never send its own values for these properties, 
 * but instead pass through the values of the wrapped view model instance. 
 * 
 * @extends ViewModel
 * 
 * @property {String} template A Handlebars template to lazy load. 
 * * Read-only. 
 * @property {Function} viewModelFactoryFunction A function that returns a view 
   * model instance for the lazy loaded template. Receives the view model args 
   * as its only argument. 
 * * Read-only. 
 * @property {Object} viewModelArgs The arguments to pass to the factory function.
 * * Read-only. 
 * @property {ViewModel | undefined} viewModel The lazy-loaded view model instance. 
 * * Read-only. 
 */
export default class LazyLoadViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.COMPONENT_LAZY_LOAD; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('lazy', `{{> "${LazyLoadViewModel.TEMPLATE}"}}`);
  }

  /**
   * Returns the shimmer element. 
   * 
   * @type {JQuery | undefined}
   * @readonly
   */
  get shimmerElement() {
    const element = this._html.find(`#${this.id} > .ambersteel-shimmer`);
    if (element.length < 1) {
      return undefined;
    } else {
      return element;
    }
  }

  /**
   * Returns the root element of the component. 
   * 
   * @type {JQuery}
   * @readonly
   */
  get element() { return this._html.find(`#${this.id}`); }

  /**
   * The cached DOM. 
   * 
   * @type {JQuery | undefined}
   * @default undefined
   * @private
   */
  _html = undefined;

  /**
   * The cached rendered content. 
   * 
   * Assuming the data model didn't change, the content won't have to be 
   * re-rendered and can instead be fetched and added to the DOM, quickly. 
   * 
   * @type {String | undefined}
   * @default undefined
   * @private
   */
  _renderedContent = undefined;

  /**
   * If true, the underlying data was updated and the content must be 
   * rendered again. 
   * 
   * @type {Boolean}
   * @default false
   * @private
   */
  _invalidated = false;

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {String} args.template A Handlebars template to lazy load. 
   * @param {Function} args.viewModelFactoryFunction A function that returns a view 
   * model instance for the lazy loaded template. Receives the view model args 
   * as its only argument. 
   * @param {Object} args.viewModelArgs The arguments to pass to the factory function. 
   */
  constructor(args = {}) {
    super(args);

    validateOrThrow(args, ["template", "viewModelFactoryFunction", "viewModelArgs"]);

    this.template = args.template;
    this.viewModelFactoryFunction = args.viewModelFactoryFunction;
    this.viewModelArgs = args.viewModelArgs;
  }

  /** @override */
  async activateListeners(html) {
    // First of all, cache the DOM we're working with. The getters rely on it. 
    this._html = html;

    // Ensure the cached rendered template is added to the DOM, *before* the 
    // child view model may attach any event listeners on the DOM. 
    // This must happen before the "super" call, as it relies on the DOM 
    // to be complete. 
    if (this._renderedContent !== undefined) {
      this.element.empty();
      this.element.append(this._renderedContent);
    }

    await super.activateListeners(html);
  }

  /**
   * Loads and instantiates the template and view model and attaches them to the DOM, 
   * as a child of this component. 
   * 
   * @async
   */
  async render() {
    // Ensure a view model instance exists. 
    if (this.viewModel === undefined) {
      this.viewModel = this.viewModelFactoryFunction({
        ...this.viewModelArgs,
        parent: this,
      });
    }

    // Render as needed. 
    if (this._renderedContent === undefined || this._invalidated === true) {
      this._renderedContent = await renderTemplate(this.template, {
        viewModel: this.viewModel,
      });
      this._invalidated = false;

      // Manipulate the DOM. 
      this.element.empty();
      this.element.append(this._renderedContent);
  
      // *After* DOM manipulations the wrapped view model may attach its event listeners. 
      await this.viewModel.activateListeners(this.element);
    }
  }

  /** @override */
  update(args = {}) {
    this._invalidated = true;

    if (this.viewModel !== undefined) {
      this.viewModel.update(args);
    }
  }

  /** @override */
  _getChildUpdates() { /* Do nothing. Never called - see `update`. */ }
}
