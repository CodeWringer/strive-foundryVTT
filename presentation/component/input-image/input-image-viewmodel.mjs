import { TEMPLATES } from "../../templatePreloader.mjs";
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
  static get TEMPLATE() { return TEMPLATES.COMPONENT_INPUT_IMAGE; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('inputImage', `{{> "${InputImageViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, input(s) will be in edit mode. If false, input(s) will be in read-only mode.
   * 
   * @param {String | undefined} args.value The current value. 
   * @param {Function | undefined} args.onChange Callback that is invoked 
   * when the value changes. Receives two arguments: 
   * * `oldValue: {String | undefined}`
   * * `newValue: {String | undefined}`
   */
  constructor(args = {}) {
    super(args);
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);
    
    this.element.click(this._onClick.bind(this));
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

    const thiz = this;

    const fp = new FilePicker({
      type: "image",
      current: this.value ?? "",
      callback: path => {
        thiz.value = path;
      },
    });
    return fp.browse();
  }
}
