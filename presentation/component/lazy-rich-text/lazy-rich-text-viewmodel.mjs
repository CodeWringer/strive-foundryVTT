import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";

/**
 * Asynchronously enriches and renders the given `String` and appends it to the DOM. 
 * 
 * @extends ViewModel
 * 
 * @property {String} renderableContent The html to enrich and render and attach to the DOM. 
 */
export default class LazyRichTextViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.COMPONENT_LAZY_LOAD_RICH_TEXT; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('lazyRichText', `{{> "${LazyRichTextViewModel.TEMPLATE}"}}`);
  }

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
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {String} args.renderableContent A Handlebars template to lazy load. 
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["renderableContent"]);

    this.renderableContent = args.renderableContent;
  }

  /** @override */
  async activateListeners(html) {
    const element = html.find(`#${this.id}`);

    if (this._renderedContent === undefined || this._invalidated === true) {
      this.readAllViewState();
      this._renderedContent = await TextEditor.enrichHTML(this.renderableContent, { async: true, secrets: this.isEditable });

      element.empty();
      element.append(this._renderedContent);
      
      await super.activateListeners(html);
    }
  }

  /** @override */
  update(args = {}) {
    ValidationUtil.validateOrThrow(args, ["renderableContent"]);
    
    this.renderableContent = args.renderableContent;
    this._invalidated = true;

    super.update(args);
  }
}
