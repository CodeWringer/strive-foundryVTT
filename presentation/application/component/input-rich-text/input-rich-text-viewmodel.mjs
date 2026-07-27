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
  static get TEMPLATE() { return TEMPLATES.application.component.richText.main; }

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
   * @type {String}
   */
  get value() { return super.value; }
  /**
   * @param {String} value 
   */
  set value(value) {
    super.value = value;

    const readModeElement = this.element.find("> .read-mode");
    readModeElement.empty();
    readModeElement.append(value);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {String | undefined} args.value The current value. 
   * @param {Boolean | undefined} args.suppressAnims If `true`, suppresses animations that would play when 
   * `isEditable` is changed at run-time. Useful for when this component is child to another, which 
   * instead handles the animations. 
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

    this.element.empty();
    this.enrichedHtml = await FoundryWrapper.TextEditor.implementation.enrichHTML(
      this.value, {
        secrets: this.isOwner,
        relativeTo: this,
      }
    );
    const rendered = await FoundryWrapper.renderTemplate(TEMPLATES.application.component.richText.lazy, {
      viewModel: this,
    });
    this.element.append(rendered);

    const editModeElm = this.element.find("> .edit-mode");
    const readModeElm = this.element.find("> .read-mode");
    if (this.isEditable) {
      editModeElm.removeClass("hidden");
      readModeElm.addClass("hidden");
    } else {
      editModeElm.addClass("hidden");
      readModeElm.removeClass("hidden");
    }
  }

  flushValue() {
    const html = this.element.find(".editor-content.ProseMirror").html();
    this.value = html;
  }
}
