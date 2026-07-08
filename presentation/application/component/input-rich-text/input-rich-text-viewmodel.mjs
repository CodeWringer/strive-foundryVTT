import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a rich-text-editor. 
 * 
 * Internally, this works as a wrapper to a tinyMCE editor, the way FoundryVTT includes it. 
 * 
 * @property {String} value The current value. 
 * 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {String}`
 * * `newValue: {String}`
 * 
 * @extends InputViewModel
 */
export default class InputRichTextViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.richText; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputRichText', `{{> "${InputRichTextViewModel.TEMPLATE}"}}`);
  }

  /** @override */
  get clazz() { return InputRichTextViewModel; }

  /**
   * @type {JQuery}
   * @readonly
   */
  get editModeElement() { return this.element.find(".edit-mode"); }

  /**
   * @type {JQuery}
   * @readonly
   */
  get editorPlaceholderElement() { return this.element.find(".editor-placeholder"); }

  /**
   * @type {JQuery}
   * @readonly
   */
  get readModeElement() { return this.element.find(".read-mode"); }

  get isEditable() { return super.isEditable; }
  set isEditable(value) {
    super.isEditable = value;

    if (value) {
      this._createEditor();
    } else if (ValidationUtil.isDefined(this.#editor)) {
      this._disposeEditor();
    }
  }

  /**
   * @type {ProseMirrorEditor}
   * @private
   */
  #editor = null;

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {String | undefined} args.value The current value. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {String}`
   * * `newValue: {String}`
   */
  constructor(args = {}) {
    super({
      ...args,
      value: args.value ?? "",
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    this.readModeElement.empty();
    const enriched = await FoundryWrapper.TextEditor.enrichHTML(this.value);
    this.readModeElement.append(enriched);

    if (this.isEditable) {
      this._createEditor();
    }
  }

  /** @override */
  dispose() {
    super.dispose();
    this._disposeEditor();
  }

  /**
   * @private
   */
  _disposeEditor() {
    if (ValidationUtil.isDefined(this.#editor)) {
      this.#editor.destroy();
    }
    this.#editor = null;
    this.editModeElement.empty();
    this.editModeElement.append('<div class="editor-placeholder"></div>');
  }

  /**
   * @returns {Promise<void>}
   * @private
   * @async
   */
  async _createEditor() {
    if (!ValidationUtil.isDefined(this.#editor)) {
      this.#editor = await FoundryWrapper.TextEditor.create({
        target: this.editorPlaceholderElement[0],
        engine: "prosemirror",
      }, this.value);

      this.element.find('button[data-action=save]').click(async (event) => {
        event.preventDefault(); // Prevents side-effects from event-bubbling. 
        this.value = "???"; // TODO #761
      });
    }
  }
}
