import FoundryWrapper from "../../../../foundry-interop/foundry-wrapper.mjs";
import { TEMPLATES } from "../../templates.mjs";
import InputViewModel from "../../view-model/input-view-model.mjs";

/**
 * Represents a changeable image. 
 * 
 * A click on the image element prompts for the selection of a new image. 
 * 
 * @property {String | undefined} value The current value. 
 * @method onChange Callback that is invoked when the value changes. 
 * Receives the following arguments: 
 * * `oldValue: {String | undefined}`
 * * `newValue: {String | undefined}`
 * 
 * @extends InputViewModel
 */
export default class InputImageViewModel extends InputViewModel {
  /** @override */
  static get TEMPLATE() { return TEMPLATES.application.component.image; }

  /** @override */
  get clazz() { return InputImageViewModel; }

  /** @override */
  get value() { return this._value; }
  /**
   * @param {String | Number} newValue The new value to set.
   * Supports integer numbers and arithmetic formulae, e. g.
   * `"33 - (7 / 2)"`
   * @override
   */
  set value(newValue) {
    if (this.isDisposed) return;

    const oldValue = this._value;
    this._value = newValue;

    const readElement = this.element.find("> .read-mode > img");
    readElement.attr("src", newValue);
    const editElement = this.element.find("> .edit-mode > img");
    editElement.attr("src", newValue);

    this.onChange(newValue, oldValue);
  }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputImage', `{{> "${InputImageViewModel.TEMPLATE}"}}`);
  }

  /** @override */
  get inputElement() { return this.element.find("> .edit-mode > img"); }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {String | undefined} args.value The current value. Must be a URL string. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `newValue: {String | undefined}`
   * * `oldValue: {String | undefined}`
   */
  constructor(args = {}) {
    super(args);
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
    
    const editModeImgElement = this.element.find("> .edit-mode > img");
    editModeImgElement.click(this._onClick.bind(this));
  }
  
  /**
   * @param {Event} event 
   * 
   * @see https://foundryvtt.com/api/global.html#FilePickerOptions
   * 
   * @private
   * @async
   */
  async _onClick(event) {
    event.preventDefault();

    const fp = new FoundryWrapper.FilePicker({
      type: "image",
      current: this.value ?? "",
      callback: path => {
        this.value = path;
      },
    });
    return fp.browse();
  }
}
