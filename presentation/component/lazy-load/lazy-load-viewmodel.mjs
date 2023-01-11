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
  activateListeners(html, isOwner, isEditable) {
    super.activateListeners(html, isOwner, isEditable);

    this._html = html;
  }

  /**
   * Loads and instantiates the template and view model and attaches them to the DOM, 
   * as a child of this component. 
   * 
   * @async
   */
  async render() {
    if (this.viewModel === undefined) {
      this.viewModel = this.viewModelFactoryFunction(this.viewModelArgs);
      this.viewModel.parent = this;
    }

    this.element.empty();

    const renderedContent = await renderTemplate(this.template, {
      viewModel: this.viewModel,
    });
    this.element.append(renderedContent);

    this.viewModel.activateListeners(this.element, this.viewModel.isOwner, this.viewModel.isEditable);
  }

  /** @override */
  update(args = {}) {
    if (this.viewModel !== undefined) {
      this.viewModel.update(args);
    }
  }

  /** @override */
  _getChildUpdates() { /* Do nothing. Never called - see `update`. */ }
}

Handlebars.registerPartial('lazy', `{{> "${LazyLoadViewModel.TEMPLATE}"}}`);
